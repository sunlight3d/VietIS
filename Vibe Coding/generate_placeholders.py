from PIL import Image, ImageDraw, ImageFont
import os

colors = {
    'bg': '#e2f6f6',
    'title': '#44989C',
    'accent': '#DB6B44'
}

titles = [
    "Bí Quyết Hiệu Suất X10",
    "Tại Sao Dùng AI Chưa Hiệu Quả?",
    "Giải Pháp: Công Thức RCESF",
    "Chi Tiết RCESF: Vai Trò & Bối Cảnh",
    "Chi Tiết RCESF: Ví Dụ & Giọng Điệu",
    "Chi Tiết RCESF: Định Dạng Đầu Ra",
    "Hệ Sinh Thái Công Cụ AI",
    "Top Công Cụ AI Xử Lý Văn Bản",
    "Top Công Cụ AI Sáng Tạo Ảnh",
    "Top Công Cụ AI Sản Xuất Video",
    "Top Công Cụ AI Tạo Giọng Nói",
    "Tổng Kết & Lời Khuyên"
]

os.makedirs('images', exist_ok=True)

try:
    font_large = ImageFont.truetype("arialbd.ttf", 36)
    font_small = ImageFont.truetype("arial.ttf", 24)
except:
    font_large = ImageFont.load_default()
    font_small = ImageFont.load_default()

for i, title in enumerate(titles):
    img = Image.new('RGB', (800, 450), color=colors['bg'])
    d = ImageDraw.Draw(img)
    
    d.rectangle([50, 50, 750, 400], outline=colors['title'], width=8)
    d.rectangle([50, 50, 200, 200], fill=colors['accent'])
    d.ellipse([600, 250, 750, 400], fill=colors['title'])
    
    # Just draw text roughly
    d.text((220, 180), f"Ảnh Minh Họa Trang {i+1}", fill=colors['title'], font=font_large)
    d.text((220, 240), title, fill=colors['accent'], font=font_small)
    
    img.save(f'images/img_{i+1}.png')

print("Generated 12 images.")
