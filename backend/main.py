import os
import httpx
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Env ayarlarını yükle
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be provided in .env file")

app = FastAPI(title="Tabeebi+ API", description="Server-Side API for Mobile and Web")

# Hem web (Doctor Panel) hem de mobil (App) için CORS izinleri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Modelleri (Veri Doğrulama) ---
class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    code: str

# --- Fonksiyonel API Endpointleri ---

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Tabeebi+ Server-Side API is running"}

@app.post("/auth/send-otp")
async def send_otp(request: OTPRequest):
    """WhatsApp üzerinden OTP gönderir (Supabase Edge Function'a proxy yapar)"""
    url = f"{SUPABASE_URL}/functions/v1/send-otp"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"phone": request.phone}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
    
    if response.status_code != 200:
        print("Send OTP Error:", response.text)
        raise HTTPException(status_code=response.status_code, detail="Failed to send OTP")
    return response.json()

@app.post("/auth/verify-otp")
async def verify_otp(request: OTPVerify):
    """Gelen OTP kodunu doğrular (Supabase Edge Function'a proxy yapar)"""
    url = f"{SUPABASE_URL}/functions/v1/verify-otp"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"phone": request.phone, "code": request.code}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
    
    if response.status_code != 200:
        print("Verify OTP Error:", response.text)
        raise HTTPException(status_code=response.status_code, detail="Failed to verify OTP")
    return response.json()

class LoginRequest(BaseModel):
    phone: str

class RegisterRequest(BaseModel):
    phone: str
    name: str

@app.post("/auth/login")
async def login(request: LoginRequest):
    """Giriş yap (Supabase Auth proxy)"""
    clean_phone = request.phone.lstrip('0')
    fake_password = "Tabeebi-Secret-123!" # Sabit şifre
    
    # Önce tam gönderilen telefonla dene
    fake_email = f"user{request.phone}@tabeebi.com"
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {"apikey": SUPABASE_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json={"email": fake_email, "password": fake_password})
        
    # Başarısız olursa sıfırsız/sıfırlı haliyle dene
    if response.status_code != 200:
        alt_phone = clean_phone if request.phone.startswith('0') else f"0{request.phone}"
        alt_email = f"user{alt_phone}@tabeebi.com"
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json={"email": alt_email, "password": fake_password})
            
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid credentials or user not found")
        
    auth_data = response.json()
    token = auth_data.get("access_token")
    auth_id = auth_data.get("user", {}).get("id")
    
    # Hastanın gerçek bilgilerini çek
    db_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id,name,phone,patient_code"
    async with httpx.AsyncClient() as client:
        db_res = await client.get(db_url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"})
        
    if db_res.status_code == 200 and len(db_res.json()) > 0:
        patient = db_res.json()[0]
    else:
        patient = {"name": "Bilinmeyen Kullanıcı", "phone": request.phone}
        
    return {"token": token, "user": patient}

@app.post("/auth/register")
async def register(request: RegisterRequest):
    """Kayıt ol (Supabase Auth proxy ve DB işlemleri)"""
    clean_phone = request.phone.lstrip('0')
    fake_email = f"user{clean_phone}@tabeebi.com"
    fake_password = "Tabeebi-Secret-123!"
    
    url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {"apikey": SUPABASE_KEY}
    payload = {"email": fake_email, "password": fake_password}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        
    # Eğer bu email (sıfırsız) ile zaten kayıtlıysa, belki eskiden login olabiliyordur ama signup fail verir.
    # Yine de 400 hatası dönülecek ama login tarafında sıfırsız deneyebildiği için login çalışacak.
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Registration failed, maybe user exists")
        
    auth_data = response.json()
    token = auth_data.get("access_token")
    auth_id = auth_data.get("user", {}).get("id")
    
    # 2. Geçici hasta (Guest) var mı diye kontrol et (Hem sıfırlı hem sıfırsız)
    phones_to_check = f"in.({clean_phone},0{clean_phone})"
    db_url = f"{SUPABASE_URL}/rest/v1/patients?phone={phones_to_check}&select=id,patient_code"
    async with httpx.AsyncClient() as client:
        guest_res = await client.get(db_url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"})
        
    final_patient = {"name": request.name, "phone": clean_phone, "patient_code": None, "id": None}
    
    if guest_res.status_code == 200 and len(guest_res.json()) > 0:
        guest = guest_res.json()[0]
        patch_url = f"{SUPABASE_URL}/rest/v1/patients?id=eq.{guest['id']}"
        patch_payload = {"auth_id": auth_id, "name": request.name, "is_registered": True, "phone": clean_phone}
        async with httpx.AsyncClient() as client:
            await client.patch(patch_url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}", "Content-Type": "application/json"}, json=patch_payload)
        final_patient["id"] = guest["id"]
        final_patient["patient_code"] = guest["patient_code"]
    else:
        post_url = f"{SUPABASE_URL}/rest/v1/patients"
        post_payload = {"auth_id": auth_id, "phone": clean_phone, "name": request.name, "is_registered": True}
        async with httpx.AsyncClient() as client:
            post_res = await client.post(post_url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}", "Content-Type": "application/json", "Prefer": "return=representation"}, json=post_payload)
            if post_res.status_code in [200, 201] and len(post_res.json()) > 0:
                final_patient["id"] = post_res.json()[0].get("id")
                final_patient["patient_code"] = post_res.json()[0].get("patient_code")

    # 3. Randevuları bağla
    if final_patient["id"]:
        apt_url = f"{SUPABASE_URL}/rest/v1/appointments?patient_phone={phones_to_check}&patient_id=is.null"
        apt_payload = {"patient_id": final_patient["id"]}
        async with httpx.AsyncClient() as client:
            await client.patch(apt_url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}", "Content-Type": "application/json"}, json=apt_payload)
            
    return {"token": token, "user": final_patient}

@app.get("/auth/me")
async def get_me(token: str):
    """Token ile kullanıcı bilgilerini getirir"""
    url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    auth_id = response.json().get("id")
    
    db_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id,name,phone,patient_code"
    async with httpx.AsyncClient() as client:
        db_res = await client.get(db_url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"})
        
    if db_res.status_code == 200 and len(db_res.json()) > 0:
        return {"user": db_res.json()[0]}
        
    raise HTTPException(status_code=404, detail="Patient profile not found")

@app.get("/patients/{phone}")
async def get_patient(phone: str):
    """Telefon numarasına göre hasta kontrolü yapar (Login için)"""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    clean_phone = phone.lstrip('0')
    phones_to_check = f"in.({clean_phone},0{clean_phone})"
    
    url = f"{SUPABASE_URL}/rest/v1/patients?phone={phones_to_check}&select=id"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        
    print(f"DB Check for {phone} (checked {phones_to_check}) - Status: {response.status_code}")
    
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Database error")
        
    data = response.json()
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return {"patient": data[0]}
        
@app.get("/doctors/{doctor_id}/schedule")
async def get_doctor_schedule(doctor_id: str):
    """Doktorun çalışma saatlerini getirir"""
    url = f"{SUPABASE_URL}/rest/v1/doctors?id=eq.{doctor_id}&select=schedule"
    headers = {"apikey": SUPABASE_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        
    if response.status_code == 200 and len(response.json()) > 0:
        return {"schedule": response.json()[0].get("schedule")}
    raise HTTPException(status_code=404, detail="Doctor schedule not found")

@app.get("/appointments/booked-times")
async def get_booked_times(doctor_id: str, date: str):
    """Belirli bir tarihteki dolu randevu saatlerini getirir"""
    url = f"{SUPABASE_URL}/rest/v1/appointments?doctor_id=eq.{doctor_id}&date=eq.{date}&status=neq.cancelled&select=time"
    headers = {"apikey": SUPABASE_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        
    if response.status_code == 200:
        times = [item["time"] for item in response.json()]
        return {"bookedTimes": times}
    return {"bookedTimes": []}

@app.post("/appointments")
async def create_appointment(appointment: dict):
    """Yeni bir randevu oluşturur"""
    url = f"{SUPABASE_URL}/rest/v1/appointments"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=appointment)
        
    if response.status_code in [200, 201]:
        return {"status": "success", "appointment": response.json()[0]}
    raise HTTPException(status_code=500, detail="Failed to create appointment")

@app.get("/appointments/me")
async def get_my_appointments(token: str):
    """Hastanın tüm randevularını (doktor bilgileriyle birlikte) getirir"""
    # 1. Get patient ID from token
    user_url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_url, headers=headers)
        
    if user_res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    auth_id = user_res.json().get("id")
    
    # Get patient internal ID
    pt_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id"
    async with httpx.AsyncClient() as client:
        pt_res = await client.get(pt_url, headers=headers)
        
    if pt_res.status_code != 200 or len(pt_res.json()) == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    patient_id = pt_res.json()[0]["id"]
    
    # 2. Get appointments with doctor details
    # PostgREST allows nested queries: select=*,doctors(id,name,specialty,initials,hue,price)
    apt_url = f"{SUPABASE_URL}/rest/v1/appointments?patient_id=eq.{patient_id}&select=*,doctors(id,name,specialty,initials,hue,price)&order=date.desc"
    async with httpx.AsyncClient() as client:
        apt_res = await client.get(apt_url, headers=headers)
        
    if apt_res.status_code == 200:
        return {"appointments": apt_res.json()}
    raise HTTPException(status_code=500, detail="Failed to fetch appointments")

@app.patch("/appointments/{id}")
async def update_appointment(id: str, updates: dict):
    """Randevuyu günceller (iptal etme veya değerlendirme)"""
    url = f"{SUPABASE_URL}/rest/v1/appointments?id=eq.{id}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.patch(url, headers=headers, json=updates)
        
    if response.status_code in [200, 204]:
        return {"status": "success"}
    raise HTTPException(status_code=500, detail="Failed to update appointment")

@app.get("/appointments/next")
async def get_next_appointment(token: str):
    """Hastanın yaklaşan ilk randevusunu getirir"""
    user_url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_url, headers=headers)
    if user_res.status_code != 200: raise HTTPException(status_code=401, detail="Invalid token")
    auth_id = user_res.json().get("id")
    
    pt_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id"
    async with httpx.AsyncClient() as client:
        pt_res = await client.get(pt_url, headers=headers)
    if pt_res.status_code != 200 or len(pt_res.json()) == 0: raise HTTPException(status_code=404, detail="Patient not found")
    patient_id = pt_res.json()[0]["id"]
    
    import datetime
    now = datetime.datetime.now()
    local_date = now.strftime("%Y-%m-%d")
    
    url = f"{SUPABASE_URL}/rest/v1/appointments?patient_id=eq.{patient_id}&status=in.(pending,confirmed)&date=gte.{local_date}&select=*,doctors(name,specialty,initials,hue,loc)&order=date.asc,time.asc&limit=1"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        
    if res.status_code == 200 and len(res.json()) > 0:
        return {"appointment": res.json()[0]}
    return {"appointment": None}

@app.get("/doctors/recommended")
async def get_recommended_doctors(token: str):
    """Hastanın geçmiş randevularına göre tavsiye edilen doktorları getirir"""
    user_url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_url, headers=headers)
    if user_res.status_code != 200: raise HTTPException(status_code=401, detail="Invalid token")
    auth_id = user_res.json().get("id")
    
    pt_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id"
    async with httpx.AsyncClient() as client:
        pt_res = await client.get(pt_url, headers=headers)
    if pt_res.status_code != 200 or len(pt_res.json()) == 0: raise HTTPException(status_code=404, detail="Patient not found")
    patient_id = pt_res.json()[0]["id"]

    past_apts_url = f"{SUPABASE_URL}/rest/v1/appointments?patient_id=eq.{patient_id}&rating=gte.4&select=rating,doctors(specialty)"
    async with httpx.AsyncClient() as client:
        past_res = await client.get(past_apts_url, headers=headers)
    preferred_specs = set()
    if past_res.status_code == 200:
        for apt in past_res.json():
            if apt.get("doctors") and apt["doctors"].get("specialty"):
                preferred_specs.add(apt["doctors"]["specialty"])
                
    docs_url = f"{SUPABASE_URL}/rest/v1/doctors?is_active=eq.true&select=*"
    async with httpx.AsyncClient() as client:
        docs_res = await client.get(docs_url, headers={"apikey": SUPABASE_KEY})
        
    if docs_res.status_code != 200:
        return {"doctors": []}
        
    docs = docs_res.json()
    import math
    scored = []
    for d in docs:
        score = (float(d.get("rating") or 4.5)) * 10
        score += math.log((d.get("reviews") or 0) + 1) * 5
        if d.get("specialty") in preferred_specs:
            score += 30
        if d.get("today"):
            score += 15
            
        scored.append({
            "id": d.get("id"),
            "name": d.get("name"),
            "specialty": d.get("specialty"),
            "initials": d.get("initials") or d.get("name", "")[:2].upper(),
            "hue": d.get("hue") or 175,
            "rating": float(d.get("rating") or 4.5),
            "reviews": d.get("reviews") or 0,
            "price": d.get("price") or 35000,
            "loc": d.get("loc") or "",
            "exp": d.get("exp") or "10 Yıl",
            "today": d.get("today"),
            "registration_id": d.get("registration_id"),
            "location_lat": d.get("location_lat"),
            "location_lng": d.get("location_lng"),
            "recommendationScore": score
        })
        
    top3 = sorted(scored, key=lambda x: x["recommendationScore"], reverse=True)[:3]
    return {"doctors": top3}

@app.get("/doctor_schedules/{registration_id}")
async def get_doctor_schedule_by_reg_id(registration_id: str):
    """Registration ID'ye göre doktor çalışma takvimini getirir (DoctorDetailScreen için)"""
    url = f"{SUPABASE_URL}/rest/v1/doctor_schedules?doctor_registration_id=eq.{registration_id}&select=schedule"
    headers = {"apikey": SUPABASE_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        
    if response.status_code == 200 and len(response.json()) > 0:
        return {"schedule": response.json()[0].get("schedule")}
        
    raise HTTPException(status_code=404, detail="Doctor schedule not found")

@app.get("/patient/counts")
async def get_patient_counts(token: str):
    """ProfileScreen için sayaçları getirir (bookings, results, unread notifications)"""
    user_url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_url, headers=headers)
    if user_res.status_code != 200: raise HTTPException(status_code=401, detail="Invalid token")
    auth_id = user_res.json().get("id")
    
    pt_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id"
    async with httpx.AsyncClient() as client:
        pt_res = await client.get(pt_url, headers=headers)
    if pt_res.status_code != 200 or len(pt_res.json()) == 0: raise HTTPException(status_code=404, detail="Patient not found")
    patient_id = pt_res.json()[0]["id"]
    
    counts = {"bookings": 0, "results": 0, "notifications": 0}
    
    async with httpx.AsyncClient() as client:
        count_headers = {**headers, "Prefer": "count=exact"}
        
        # Bookings count
        b_res = await client.head(f"{SUPABASE_URL}/rest/v1/appointments?patient_id=eq.{patient_id}&status=in.(pending,confirmed)", headers=count_headers)
        if "content-range" in b_res.headers:
            total = b_res.headers["content-range"].split("/")[-1]
            counts["bookings"] = int(total) if total != "*" else 0
            
        # Results count
        r_res = await client.head(f"{SUPABASE_URL}/rest/v1/appointments?patient_id=eq.{patient_id}&status=eq.completed&report_uploaded=eq.true", headers=count_headers)
        if "content-range" in r_res.headers:
            total = r_res.headers["content-range"].split("/")[-1]
            counts["results"] = int(total) if total != "*" else 0
            
        # Unread notifications count
        n_res = await client.head(f"{SUPABASE_URL}/rest/v1/notifications?patient_id=eq.{patient_id}&unread=eq.true", headers=count_headers)
        if "content-range" in n_res.headers:
            total = n_res.headers["content-range"].split("/")[-1]
            counts["notifications"] = int(total) if total != "*" else 0
            
    return counts

@app.get("/notifications")
async def get_notifications(token: str):
    user_url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_url, headers=headers)
    if user_res.status_code != 200: raise HTTPException(status_code=401, detail="Invalid token")
    auth_id = user_res.json().get("id")
    
    pt_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id"
    async with httpx.AsyncClient() as client:
        pt_res = await client.get(pt_url, headers=headers)
    if pt_res.status_code != 200 or len(pt_res.json()) == 0: raise HTTPException(status_code=404, detail="Patient not found")
    patient_id = pt_res.json()[0]["id"]
    
    url = f"{SUPABASE_URL}/rest/v1/notifications?patient_id=eq.{patient_id}&order=created_at.desc"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
    if res.status_code == 200:
        return {"notifications": res.json()}
    return {"notifications": []}

@app.patch("/notifications/mark-read")
async def mark_notifications_read(token: str, body: dict = None):
    # body={"id": "..."} ise sadece onu, yoksa tümünü okundu işaretle
    user_url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_url, headers=headers)
    if user_res.status_code != 200: raise HTTPException(status_code=401, detail="Invalid token")
    auth_id = user_res.json().get("id")
    
    pt_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id"
    async with httpx.AsyncClient() as client:
        pt_res = await client.get(pt_url, headers=headers)
    if pt_res.status_code != 200 or len(pt_res.json()) == 0: raise HTTPException(status_code=404, detail="Patient not found")
    patient_id = pt_res.json()[0]["id"]
    
    if body and "id" in body:
        url = f"{SUPABASE_URL}/rest/v1/notifications?id=eq.{body['id']}"
    else:
        url = f"{SUPABASE_URL}/rest/v1/notifications?patient_id=eq.{patient_id}&unread=eq.true"
        
    async with httpx.AsyncClient() as client:
        res = await client.patch(url, headers=headers, json={"unread": False})
    if res.status_code in [200, 204]:
        return {"status": "success"}
    raise HTTPException(status_code=500, detail="Failed to mark notifications read")

@app.get("/results")
async def get_patient_results(token: str):
    user_url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_url, headers=headers)
    if user_res.status_code != 200: raise HTTPException(status_code=401, detail="Invalid token")
    auth_id = user_res.json().get("id")
    
    pt_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id"
    async with httpx.AsyncClient() as client:
        pt_res = await client.get(pt_url, headers=headers)
    if pt_res.status_code != 200 or len(pt_res.json()) == 0: raise HTTPException(status_code=404, detail="Patient not found")
    patient_id = pt_res.json()[0]["id"]
    
    url = f"{SUPABASE_URL}/rest/v1/appointments?patient_id=eq.{patient_id}&status=eq.completed&report_uploaded=eq.true&select=id,date,ai_summary,pdf_url,doctors(name,specialty)&order=created_at.desc"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
    if res.status_code == 200:
        return {"results": res.json()}
    return {"results": []}

@app.get("/doctors")
async def get_doctors():
    url = f"{SUPABASE_URL}/rest/v1/doctors?is_active=eq.true&select=*"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers={"apikey": SUPABASE_KEY})
    if res.status_code == 200:
        return {"doctors": res.json()}
    return {"doctors": []}

@app.get("/support_tickets")
async def get_support_tickets(token: str):
    user_url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_url, headers=headers)
    if user_res.status_code != 200: raise HTTPException(status_code=401, detail="Invalid token")
    auth_id = user_res.json().get("id")
    
    pt_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id"
    async with httpx.AsyncClient() as client:
        pt_res = await client.get(pt_url, headers=headers)
    if pt_res.status_code != 200 or len(pt_res.json()) == 0: raise HTTPException(status_code=404, detail="Patient not found")
    patient_id = pt_res.json()[0]["id"]
    
    url = f"{SUPABASE_URL}/rest/v1/support_tickets?patient_id=eq.{patient_id}&order=created_at.desc"
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
    if res.status_code == 200:
        return {"tickets": res.json()}
    return {"tickets": []}

@app.post("/support_tickets")
async def create_support_ticket(token: str, ticket: dict):
    user_url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}", "Content-Type": "application/json", "Prefer": "return=representation"}
    
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_url, headers=headers)
    if user_res.status_code != 200: raise HTTPException(status_code=401, detail="Invalid token")
    auth_id = user_res.json().get("id")
    
    pt_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id"
    async with httpx.AsyncClient() as client:
        pt_res = await client.get(pt_url, headers=headers)
    if pt_res.status_code != 200 or len(pt_res.json()) == 0: raise HTTPException(status_code=404, detail="Patient not found")
    patient_id = pt_res.json()[0]["id"]
    
    ticket["patient_id"] = patient_id
    url = f"{SUPABASE_URL}/rest/v1/support_tickets"
    async with httpx.AsyncClient() as client:
        res = await client.post(url, headers=headers, json=ticket)
    if res.status_code in [200, 201]:
        return {"status": "success"}
    raise HTTPException(status_code=500, detail="Failed to create ticket")

@app.delete("/account")
async def delete_account(token: str):
    user_url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_url, headers=headers)
    if user_res.status_code != 200: raise HTTPException(status_code=401, detail="Invalid token")
    auth_id = user_res.json().get("id")
    
    pt_url = f"{SUPABASE_URL}/rest/v1/patients?auth_id=eq.{auth_id}&select=id"
    async with httpx.AsyncClient() as client:
        pt_res = await client.get(pt_url, headers=headers)
    if pt_res.status_code != 200 or len(pt_res.json()) == 0: raise HTTPException(status_code=404, detail="Patient not found")
    patient_id = pt_res.json()[0]["id"]
    
    url = f"{SUPABASE_URL}/rest/v1/patients?id=eq.{patient_id}"
    async with httpx.AsyncClient() as client:
        res = await client.patch(url, headers=headers, json={"name": "Silinmiş Kullanıcı"})
        
    if res.status_code in [200, 204]:
        return {"status": "success"}
    raise HTTPException(status_code=500, detail="Failed to delete account")
