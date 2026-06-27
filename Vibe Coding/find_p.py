import re

with open("unpacked/word/document.xml", "r", encoding="utf-8") as f:
    xml_content = f.read()

paragraphs = re.findall(r'<w:p[ >].*?</w:p>', xml_content)
for p in paragraphs:
    if "trắc nghiệm" in p or "cạnh tranh" in p:
        print("FOUND:", p[:100], "...", p[-50:])
