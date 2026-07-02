const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, PageBreak, PageOrientation } = require('docx');
const fs = require('fs');

const COLOR_TITLE = "44989C";
const COLOR_ACCENT = "DB6B44";
const COLOR_BODY = "333333";

const pages = [
    {
        title: "BÍ QUYẾT TỐI ƯU HIỆU SUẤT X10 VỚI CÔNG CỤ AI",
        content: [
            { text: "Ứng dụng thực tế cho Hành chính, Văn phòng, Giáo dục & Sáng tạo nội dung.", accent: false },
            { text: "Dựa trên công thức RCESF và hệ sinh thái công cụ AI mạnh mẽ nhất.", accent: true }
        ]
    },
    {
        title: "TẠI SAO NHIỀU NGƯỜI DÙNG AI CHƯA HIỆU QUẢ?",
        content: [
            { text: "Vấn đề:", accent: true },
            { text: "- Ra lệnh bằng những câu ngắn, chung chung.", accent: false },
            { text: "- Kết quả: AI viết lan man, giống sách vở, thiếu cảm xúc.", accent: false },
            { text: "- Không đúng tệp khách hàng, không đúng bối cảnh cơ quan.", accent: false }
        ]
    },
    {
        title: "GIẢI PHÁP - CÔNG THỨC PROMPT RCESF",
        content: [
            { text: "Công thức RCESF là bộ khung chuẩn chỉnh giúp giao việc cho AI rõ ràng.", accent: false },
            { text: "R – Role (Vai trò): Bạn đang là ai để làm việc này?", accent: true },
            { text: "C – Context (Bối cảnh): Tình huống của tôi là gì?", accent: true },
            { text: "E – Example (Ví dụ): Mẫu tôi muốn giống như vậy.", accent: true },
            { text: "S – Style (Giọng điệu): Viết theo phong cách nào?", accent: true },
            { text: "F – Format (Định dạng): Trình bày ra sao?", accent: true }
        ]
    },
    {
        title: "CHI TIẾT RCESF - VAI TRÒ (R) & BỐI CẢNH (C)",
        content: [
            { text: "Giao đúng vai (Role):", accent: true },
            { text: "Giúp AI có góc nhìn chuyên môn. Ví dụ: 'Bạn là chuyên viên hành chính'.", accent: false },
            { text: "Bối cảnh rõ ràng (Context):", accent: true },
            { text: "Giúp AI hiểu đúng tệp khách hàng, hoàn cảnh. Ví dụ: 'Viết email báo cáo tiến độ cho lãnh đạo'.", accent: false }
        ]
    },
    {
        title: "CHI TIẾT RCESF - VÍ DỤ (E) & GIỌNG ĐIỆU (S)",
        content: [
            { text: "Cung cấp mẫu (Example):", accent: true },
            { text: "Vũ khí bí mật giúp AI bắt nhịp siêu nhanh. Ví dụ: 'Làm theo mẫu đính kèm'.", accent: false },
            { text: "Quy định giọng điệu (Style):", accent: true },
            { text: "Tránh việc AI viết như robot. Ví dụ: 'Giọng văn chuyên nghiệp, súc tích'.", accent: false }
        ]
    },
    {
        title: "CHI TIẾT RCESF - ĐỊNH DẠNG ĐẦU RA (F)",
        content: [
            { text: "Định dạng đầu ra (Format):", accent: true },
            { text: "Giúp bạn copy/paste dùng được ngay mà không cần sửa.", accent: false },
            { text: "Ví dụ:", accent: false },
            { text: "- Trình bày thành 5 gạch đầu dòng.", accent: false },
            { text: "- Mỗi ý không quá 2 dòng.", accent: false },
            { text: "- Viết dưới dạng bảng so sánh.", accent: false }
        ]
    },
    {
        title: "TỔNG QUAN HỆ SINH THÁI CÔNG CỤ AI HIỆN NAY",
        content: [
            { text: "Không cần dùng tất cả, hãy dùng đúng việc - đúng mục tiêu.", accent: true },
            { text: "- Xử lý Văn bản & Tài liệu: Trợ lý tư duy", accent: false },
            { text: "- Sáng tạo Hình ảnh: Tối ưu thiết kế", accent: false },
            { text: "- Sản xuất Video: Chuyển đổi nội dung", accent: false },
            { text: "- Âm thanh & Giọng nói: Giao tiếp tự nhiên", accent: false }
        ]
    },
    {
        title: "TOP CÔNG CỤ AI XỬ LÝ VĂN BẢN & TÀI LIỆU",
        content: [
            { text: "1. ChatGPT:", accent: true },
            { text: "Trợ lý đa năng, giỏi viết content, lên kịch bản.", accent: false },
            { text: "2. Gemini:", accent: true },
            { text: "Đọc hiểu tài liệu siêu mạnh, tóm tắt PDF dài.", accent: false },
            { text: "3. Notion AI & Copilot:", accent: true },
            { text: "Hệ thống hóa nội dung và tích hợp sâu vào văn phòng.", accent: false }
        ]
    },
    {
        title: "TOP CÔNG CỤ AI SÁNG TẠO HÌNH ẢNH",
        content: [
            { text: "1. Midjourney:", accent: true },
            { text: "Đỉnh cao nghệ thuật, hình ảnh độc bản chi tiết.", accent: false },
            { text: "2. Leonardo AI:", accent: true },
            { text: "Tạo ảnh marketing thương mại, minh họa đào tạo.", accent: false },
            { text: "3. Canva & Adobe Firefly:", accent: true },
            { text: "Thiết kế nhanh chóng, phổ cập và chuẩn bản quyền.", accent: false }
        ]
    },
    {
        title: "TOP CÔNG CỤ AI SẢN XUẤT VIDEO",
        content: [
            { text: "1. CapCut:", accent: true },
            { text: "Phần mềm quốc dân làm video ngắn, auto phụ đề.", accent: false },
            { text: "2. Kling AI / Sora / Veo:", accent: true },
            { text: "Nhóm AI cao cấp biến text/ảnh thành video siêu thực.", accent: false },
            { text: "3. HeyGen:", accent: true },
            { text: "Tạo video có MC ảo nói chuyện tự nhiên.", accent: false }
        ]
    },
    {
        title: "TOP CÔNG CỤ AI TẠO GIỌNG NÓI & ÂM NHẠC",
        content: [
            { text: "1. ElevenLabs:", accent: true },
            { text: "Tạo giọng đọc AI đa ngôn ngữ giàu cảm xúc.", accent: false },
            { text: "2. Vbee:", accent: true },
            { text: "Nền tảng giọng nói tiếng Việt hàng đầu cho thuyết minh.", accent: false },
            { text: "3. Suno / Udio:", accent: true },
            { text: "Tạo nhạc nền, bài hát từ văn bản không lo bản quyền.", accent: false }
        ]
    },
    {
        title: "TỔNG KẾT & LỜI KHUYÊN ÁP DỤNG AI",
        content: [
            { text: "Nguyên tắc: Bắt đầu từ công cụ dễ, có kết quả ngay.", accent: true },
            { text: "Chỉ cần nắm vững 3-5 công cụ cốt lõi phục vụ trực tiếp cho công việc.", accent: false },
            { text: "Nhớ công thức RCESF để tối ưu hóa kết quả đầu ra.", accent: true },
            { text: "Không cần dùng hàng chục công cụ, chỉ cần dùng ĐÚNG CÔNG CỤ vào ĐÚNG TÁC VỤ.", accent: true }
        ]
    }
];

const children = [];

pages.forEach((page, index) => {
    // Title
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
            children: [
                new TextRun({
                    text: page.title,
                    bold: true,
                    size: 60, // 30pt
                    color: COLOR_TITLE,
                    font: "Arial"
                })
            ]
        })
    );

    // Image
    const imgPath = `images/img_${index + 1}.png`;
    if (fs.existsSync(imgPath)) {
        children.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
                children: [
                    new ImageRun({
                        type: "png",
                        data: fs.readFileSync(imgPath),
                        transformation: { width: 600, height: 337 }, // 16:9 ratio
                        altText: { title: "Image", description: "Image", name: "Image" }
                    })
                ]
            })
        );
    }

    // Content
    page.content.forEach(item => {
        children.push(
            new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 200, after: 200 },
                children: [
                    new TextRun({
                        text: item.text,
                        bold: item.accent,
                        size: 40, // 20pt
                        color: item.accent ? COLOR_ACCENT : COLOR_BODY,
                        font: "Arial"
                    })
                ]
            })
        );
    });

    // Page Break (except last page)
    if (index < pages.length - 1) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
    }
});

const doc = new Document({
    background: {
        color: "E2F6F6"
    },
    sections: [{
        properties: {
            page: {
                size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE },
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
        },
        children: children
    }]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("AI_Tools_Presentation.docx", buffer);
    console.log("Successfully created AI_Tools_Presentation.docx");
}).catch(err => console.error(err));
