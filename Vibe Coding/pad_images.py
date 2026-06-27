import os
import glob
from PIL import Image, ImageFilter

src_folder = r"C:\code\VietIS\Vibe Coding\temp"
dst_folder = os.path.join(r"C:\code\VietIS\Vibe Coding", "Tài liệu miễn phí tặng khách")

if not os.path.exists(dst_folder):
    os.makedirs(dst_folder)

files = glob.glob(os.path.join(src_folder, "*_v2_*.png"))

for file_path in files:
    img = Image.open(file_path)
    if img.size[0] != img.size[1]:
        img.close()
        continue

    # Create foreground
    foreground = img.resize((1080, 1080), Image.Resampling.LANCZOS)
    
    # Create background
    bg = img.resize((1920, 1920), Image.Resampling.LANCZOS)
    top = (1920 - 1080) // 2
    bg = bg.crop((0, top, 1920, top + 1080))
    bg = bg.filter(ImageFilter.GaussianBlur(radius=50))
    bg = bg.point(lambda p: p * 0.8) # Darken
    
    # Paste foreground
    bg.paste(foreground, (420, 0))
    
    filename = os.path.basename(file_path)
    new_filename = filename.replace('_v2_', '_v3_')
    save_path = os.path.join(dst_folder, new_filename)
    
    bg.save(save_path)
    img.close()
    
print("Successfully generated 16:9 images.")
