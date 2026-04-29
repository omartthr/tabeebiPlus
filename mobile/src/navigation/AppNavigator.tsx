import React, { useState, useEffect, createContext, useContext } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import DoctorListScreen from '../screens/doctors/DoctorListScreen';
import DoctorDetailScreen from '../screens/doctors/DoctorDetailScreen';
import BookingScreen from '../screens/appointments/BookingScreen';
import ConfirmedScreen from '../screens/appointments/ConfirmedScreen';
import HelpScreen from '../screens/support/HelpScreen';
import { UserData } from '../types/navigation';
import { supabase } from '../lib/supabase';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

interface AuthContextValue {
  user: UserData | null;
  signIn: (u: UserData) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  signIn: async () => false,
  signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

const Stack = createNativeStackNavigator<MainStackParamList>();

function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="DoctorList" component={DoctorListScreen} />
      <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Confirmed" component={ConfirmedScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Oturum kontrol hatası:', error);
      if (data?.session) {
        loadPatient(data.session.user.id);
        registerForPushNotificationsAsync(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadPatient(session.user.id);
        registerForPushNotificationsAsync(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen for notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
    return () => subscription.remove();
  }, []);

  // Supabase'den hasta bilgilerini çek
  const loadPatient = async (authId: string) => {
    const { data } = await supabase
      .from('patients')
      .select('id, name, phone, patient_code')
      .eq('auth_id', authId)
      .single();

    if (data) setUser({ id: data.id, name: data.name, phone: data.phone, patient_code: data.patient_code });
    setLoading(false);
  };

  const signIn = async (u: UserData): Promise<boolean> => {
    try {
      const fakeEmail = `user${u.phone.replace(/[^0-9]/g, '')}@tabeebi.com`;
      const fakePassword = process.env.EXPO_PUBLIC_DUMMY_PASSWORD || 'Fallback-Secret-123!';

      if (u.isLogin) {
        // GİRİŞ YAP (Login) Flow
        let { data, error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password: fakePassword,
        });

        if (error) {
          Alert.alert('Giriş Hatası', 'Bu numaraya ait bir hesap bulunamadı veya hatalı.');
          return false;
        }

        if (data?.session) {
          // Fetch real name from database
          const { data: existing } = await supabase
            .from('patients')
            .select('id, name, phone, patient_code')
            .eq('auth_id', data.session.user.id)
            .maybeSingle();

          if (existing) {
            setUser({ id: existing.id, name: existing.name, phone: existing.phone, patient_code: existing.patient_code });
          } else {
            setUser({ name: 'Bilinmeyen Kullanıcı', phone: u.phone });
          }
        }
        return true;
      }

      // KAYIT OL (Register) Flow
      // First check if user already exists
      let { error: checkError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: fakePassword,
      });

      if (!checkError) {
        // Sign in succeeded, meaning account already exists!
        Alert.alert('Kayıt Hatası', 'Bu telefon numarası zaten kayıtlı. Lütfen giriş yap sayfasını kullanın.');
        await supabase.auth.signOut();
        return false;
      }

      // Account doesn't exist, proceed with signup
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: fakePassword,
      });

      if (signUpError) {
        Alert.alert('Kayıt Hatası', signUpError.message);
        return false;
      }

      if (signUpData?.session) {
        // Veritabanında daha önce doktor tarafından eklenmiş geçici hasta var mı diye bak (is_registered = false olan)
        const { data: existingGuest } = await supabase
          .from('patients')
          .select('id, patient_code')
          .eq('phone', u.phone)
          .maybeSingle();

        let finalPatientId: string | undefined;
        let finalCode: string | null = null;

        if (existingGuest) {
          // Mevcut geçici hastayı gerçek hesaba dönüştür
          const { data: updated, error: updateError } = await supabase.from('patients')
            .update({ auth_id: signUpData.session.user.id, name: u.name, is_registered: true })
            .eq('id', existingGuest.id)
            .select('id, patient_code').single();

          if (!updateError && updated) {
            finalPatientId = updated.id;
            finalCode = updated.patient_code;
          }
        } else {
          // Yepyeni bir hasta oluştur
          const { data: inserted, error: insertError } = await supabase.from('patients').insert({
            auth_id: signUpData.session.user.id,
            phone: u.phone,
            name: u.name,
            is_registered: true
          }).select('id, patient_code').single();

          if (insertError && insertError.code === '23505') {
            Alert.alert('Kayıt Hatası', 'Bu telefon numarası başka bir hesap tarafından kullanılıyor.');
            await supabase.auth.signOut();
            return false;
          }
          if (!insertError && inserted) {
            finalPatientId = inserted.id;
            finalCode = inserted.patient_code;
          }
        }

        if (finalPatientId) {
          // Doktor panelinden RLS yüzünden hasta ID'si boş kalmış randevular varsa, onları da bu ID'ye bağla
          await supabase.from('appointments')
            .update({ patient_id: finalPatientId })
            .is('patient_id', null)
            .eq('patient_phone', u.phone);

          setUser({ id: finalPatientId, name: u.name || '', phone: u.phone, patient_code: finalCode });
        } else {
          Alert.alert('Veri Kayıt Hatası', 'Hasta bilgisi veritabanına kaydedilemedi.');
          return false;
        }
      } else {
        Alert.alert('Hata', 'Kayıt sırasında bir oturum oluşturulamadı.');
        return false;
      }

      return true;

    } catch (e) {
      console.error('Beklenmedik hata:', e);
      Alert.alert('Hata', 'Supabase ile bağlantı kurulamadı.');
      return false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => { });
    setUser(null);
  };

  // Oturum kontrolü yapılıyor
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      <NavigationContainer>
        {user ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
