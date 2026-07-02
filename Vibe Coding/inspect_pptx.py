from pptx import Presentation

try:
    prs = Presentation('VIETIS.EDU_TRN_Template.pptx')
    print(f"Total layouts: {len(prs.slide_layouts)}")
    for i, layout in enumerate(prs.slide_layouts):
        print(f"\nLayout {i}: {layout.name}")
        for shape in layout.placeholders:
            print(f"  - id={shape.placeholder_format.idx}, name={shape.name}, type={shape.placeholder_format.type}")
except Exception as e:
    print(f"Error: {e}")
