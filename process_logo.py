import sys
from PIL import Image

def process_logo(input_path, output_light, output_dark):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    # 1. Create light logo (transparent bg)
    light_data = []
    for r, g, b, a in data:
        dist_from_white = ((255-r)**2 + (255-g)**2 + (255-b)**2)**0.5
        if dist_from_white < 5:
            light_data.append((255, 255, 255, 0))
        elif dist_from_white < 120:
            # Edge pixel: reduce alpha to remove white halo
            # We assume the background was white. 
            # If a pixel is (200, 200, 200), its original color was darker, mixed with white.
            # We scale alpha based on distance.
            alpha = int((dist_from_white / 120) * 255)
            # Make the color darker to compensate for the white mix
            factor = 255 / (alpha + 1)
            new_r = max(0, min(255, int(255 - (255 - r) * factor)))
            new_g = max(0, min(255, int(255 - (255 - g) * factor)))
            new_b = max(0, min(255, int(255 - (255 - b) * factor)))
            light_data.append((r, g, b, alpha))
        else:
            light_data.append((r, g, b, 255))
            
    img_light = Image.new("RGBA", img.size)
    img_light.putdata(light_data)
    img_light.save(output_light, "PNG")
    print("Saved light logo")
    
    # 2. Create dark logo (transparent bg, white text, teal +)
    dark_data = []
    for r, g, b, a in light_data:
        if a == 0:
            dark_data.append((255, 255, 255, 0))
        else:
            # Is it dark text? (Stethoscope and tabeebi are very dark)
            if r < 100 and g < 100 and b < 100:
                dark_data.append((255, 255, 255, a))
            else:
                dark_data.append((r, g, b, a))
                
    img_dark = Image.new("RGBA", img.size)
    img_dark.putdata(dark_data)
    img_dark.save(output_dark, "PNG")
    print("Saved dark logo")

if __name__ == "__main__":
    process_logo(
        "C:/Users/lenovo/.gemini/antigravity/brain/31ffb7e0-e3e5-4b46-b45f-8816ce79baaa/media__1779465752238.png",
        "c:/Users/lenovo/OneDrive/Desktop/tabeebi+/mobile/assets/images/logo_light.png",
        "c:/Users/lenovo/OneDrive/Desktop/tabeebi+/mobile/assets/images/logo_dark.png"
    )
