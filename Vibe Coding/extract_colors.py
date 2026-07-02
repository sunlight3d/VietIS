from PIL import Image
from collections import Counter
import os

img_path = r"C:\Users\ADMIN\.gemini\antigravity\brain\10f392a7-26c2-44ba-b86e-08ecad9e66fe\media__1782706091348.png"
if os.path.exists(img_path):
    img = Image.open(img_path).convert('RGB')
    
    # We will resize image to speed up processing and smooth out artifacts
    img = img.resize((img.width // 4, img.height // 4))
    pixels = list(img.getdata())
    
    counts = Counter(pixels)
    
    print("Top colors (excluding very light backgrounds):")
    for color, count in counts.most_common():
        # filter out light colors where r, g, b are all > 200
        if not (color[0] > 200 and color[1] > 200 and color[2] > 200):
            hex_code = '#{:02x}{:02x}{:02x}'.format(color[0], color[1], color[2])
            print(f"{hex_code} - RGB: {color} - Count: {count}")
            
            # just print top 10 non-background
            if count < 50: # arbitrary cutoff
                break
