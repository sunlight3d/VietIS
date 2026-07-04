const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// Ensure target directory exists
const targetDir = path.join(__dirname, 'Khóa phễu 2h ngày 10-07-2026');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; 
pres.author = 'VietIS';
pres.title = 'VietIS Vibe Coding Prompts';

// --- VIETIS BRAND COLORS ---
const TEAL = "00A89D";
const ORANGE = "F05A28";
const LIGHT_TEAL = "E6F6F5";
const LIGHT_ORANGE = "FDEEE9";
const DARK_GRAY = "333333";

// --- ASSETS (Absolute Paths) ---
const logoPath = '/home/nguyenduchoang/.gemini/config/skills/pptx_vietis/assets/logo.png';
const genBgPath = '/home/nguyenduchoang/.gemini/config/skills/pptx_vietis/assets/bg.png';

// --- DEFINE SLIDE MASTER ---
pres.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { path: genBgPath },
  objects: [
    { image: { x: 0.5, y: 0.25, w: 1.5, h: 0.53, path: logoPath } }
  ]
});

// --- HELPER FUNCTIONS ---
function addTitle(slide, text, color = TEAL) {
  slide.addText(text, { x: 0.5, y: 1.0, w: 9, h: 0.6, fontSize: 26, bold: true, color: color, fontFace: 'Arial' });
}

function addSubtext(slide, text) {
  slide.addText(text, { x: 0.5, y: 1.6, w: 9, h: 0.4, fontSize: 16, color: DARK_GRAY, fontFace: 'Arial' });
}

function addBox(slide, x, y, w, h, symbol, title, body, bgColor, borderColor, titleColor) {
  let textItems = [];
  if (symbol) {
    textItems.push({ text: symbol, options: { fontSize: 22, fontFace: 'Segoe UI Emoji', color: titleColor } });
  }
  
  if (title) {
    textItems.push({ text: " " + title, options: { fontSize: 18, bold: true, color: titleColor, fontFace: 'Arial', breakLine: true, paraSpaceAfter: 4 } });
  }
  
  if (body) {
    textItems.push({ text: body, options: { fontSize: 13, color: DARK_GRAY, fontFace: 'Arial', lineSpacingMultiple: 1.15 } });
  }

  slide.addText(textItems, {
    x: x, y: y, w: w, h: h,
    shape: pres.shapes.ROUNDED_RECTANGLE,
    fill: { color: bgColor },
    line: { color: borderColor, width: 1 }, 
    rectRadius: 0.08,
    margin: 12,
    valign: 'middle',
    align: 'left' // Prompts are long, left-aligned is much better for reading than centered
  });
}

// ---------------------------------------------------------
// Slide 1: Title Slide (Intro)
let slideIntro = pres.addSlide({ masterName: "MASTER_SLIDE" });
addTitle(slideIntro, "BỘ THƯ VIỆN PROMPT THỰC CHIẾN", TEAL);
addSubtext(slideIntro, "Tài liệu giảng dạy khóa học phễu 2 giờ - Vibe Coding & AI");
addBox(
  slideIntro, 
  0.5, 2.2, 9.0, 2.8, 
  "💡", 
  "Mục tiêu buổi học:", 
  "Trang bị cho học viên bộ prompt thực chiến chuẩn RCESF để tự động hóa toàn bộ quy trình: từ nghiên cứu thị trường tuyển dụng, may đo CV/Email, đến Vibe Coding ứng dụng trắc nghiệm và viết báo cáo kỹ thuật chỉ trong vài phút.\n\nGiảng viên: Nguyễn Đức Hoàng | VietIS Education", 
  LIGHT_ORANGE, ORANGE, ORANGE
);

// ---------------------------------------------------------
// Slide 2: Prompt 1 - Thu thập JD & Tổng hợp Excel
let slide1 = pres.addSlide({ masterName: "MASTER_SLIDE" });
addTitle(slide1, "1. Tìm Kiếm JD & Tổng Hợp Excel", TEAL);
addSubtext(slide1, "Prompt tự động thu thập thông tin tuyển dụng từ các trang web uy tín.");
const prompt1 = `[Role]: Bạn là chuyên gia phân tích dữ liệu tuyển dụng tại Việt Nam.
[Context]: Tôi cần tìm kiếm các thông tin tuyển dụng mới nhất (vẫn còn hạn nộp hồ sơ) thuộc các nhóm ngành: Công nghệ thông tin (IT), Quản lý nhà hàng, Quản lý kho, và Hành chính/Văn phòng từ các trang web uy tín (TopCV, VietnamWorks, CareerLink).
[Style]: Chuyên nghiệp, chính xác, tập trung vào dữ liệu thực tế.
[Format]: Hãy tổng hợp kết quả tìm được vào một bảng Excel gồm các cột sau:
- Tiêu đề công việc (Job Title)
- Mô tả công việc (JD)
- Hạn ứng tuyển (Deadline)
- Thông tin liên hệ (Email/Số điện thoại của nhà tuyển dụng nếu có)`;
addBox(slide1, 0.5, 2.0, 9.0, 3.2, "🔍", "Prompt mẫu RCESF:", prompt1, LIGHT_TEAL, TEAL, TEAL);

// ---------------------------------------------------------
// Slide 3: Prompt 2 - Tạo email gửi nhà tuyển dụng dựa trên Excel & JD
let slide2 = pres.addSlide({ masterName: "MASTER_SLIDE" });
addTitle(slide2, "2. Soạn Email Gửi Nhà Tuyển Dụng", ORANGE);
addSubtext(slide2, "Prompt tự động hóa viết email ứng tuyển cá nhân hóa dựa trên JD.");
const prompt2 = `[Role]: Bạn là chuyên gia tư vấn viết thư xin ứng tuyển (Cover Letter).
[Context]: Hãy đọc file Excel danh sách tuyển dụng ở bước trước. Đối với từng vị trí công việc, hãy phân tích mô tả công việc (cột JD).
[Example]: Nếu JD yêu cầu kỹ năng giải quyết sự cố kho, email cần nhấn mạnh kinh nghiệm quản trị quy trình kho thông minh.
[Style]: Thuyết phục, chuyên nghiệp, súc tích, văn phong tự nhiên không rập khuôn robot.
[Format]: Hãy thêm một cột mới vào bảng Excel có tên là "Nội dung mail gửi nhà tuyển dụng". Nội dung email này phải được viết riêng phù hợp cho từng công việc dựa trên JD cụ thể đó, có chỗ trống để điền tên ứng viên và số điện thoại liên hệ.`;
addBox(slide2, 0.5, 2.0, 9.0, 3.2, "✉️", "Prompt mẫu RCESF:", prompt2, LIGHT_ORANGE, ORANGE, ORANGE);

// ---------------------------------------------------------
// Slide 4: Prompt 3 - Soạn CV docx cá nhân hóa
let slide3 = pres.addSlide({ masterName: "MASTER_SLIDE" });
addTitle(slide3, "3. Tạo & Tối Ưu CV Sang Bản Word (.docx)", TEAL);
addSubtext(slide3, "Prompt tối ưu hóa thông tin kinh nghiệm và xuất file Word kèm ảnh chân dung.");
const prompt3 = `[Role]: Bạn là chuyên gia thiết kế CV và tư vấn hướng nghiệp cao cấp.
[Context]: Dưới đây là tóm tắt quá trình công tác thô của tôi: [Dán tóm tắt kinh nghiệm làm việc]. Tôi cũng cung cấp ảnh profile cá nhân tại đường dẫn: [Đường dẫn ảnh].
[Example]: Hãy viết lại kinh nghiệm theo công thức STAR (Situation, Task, Action, Result). Thay vì viết "làm báo cáo", hãy viết "chủ trì phân tích và lập báo cáo tháng giúp ban giám đốc giảm 15% chi phí vận hành".
[Style]: Súc tích, chuyên nghiệp, làm nổi bật năng lực hành động và kết quả đạt được.
[Format]: Tạo và xuất ra một file CV định dạng Word (.docx) hoàn chỉnh, có ảnh profile của tôi nằm cân đối ở góc trên bên phải, bố cục khoa học, sử dụng font chữ Arial/Inter hiện đại.`;
addBox(slide3, 0.5, 2.0, 9.0, 3.2, "📄", "Prompt mẫu RCESF:", prompt3, LIGHT_TEAL, TEAL, TEAL);

// ---------------------------------------------------------
// Slide 5: Prompt 4 - Vibe Coding App trắc nghiệm
let slide4 = pres.addSlide({ masterName: "MASTER_SLIDE" });
addTitle(slide4, "4. Vibe Coding App Thi Trắc Nghiệm", ORANGE);
addSubtext(slide4, "Prompt sinh mã nguồn ứng dụng ôn tập và thi thử trắc nghiệm trực quan.");
const prompt4 = `[Role]: Bạn là lập trình viên Frontend cấp cao.
[Context]: Tôi cung cấp một file ảnh chứa các câu hỏi trắc nghiệm (hoặc nội dung câu hỏi). Hãy tạo ra một ứng dụng Web dạng Single Page (file index.html duy nhất) chạy được ngay trên trình duyệt.
[Specification]: Ứng dụng phải hỗ trợ 2 chế độ:
1. Chế độ Ôn thi: Hiển thị câu hỏi và danh sách đáp án, kèm nút "Xem đáp án" để bôi xanh đáp án đúng và hiện giải thích chi tiết.
2. Chế độ Thi thử: Hiển thị từng câu hỏi một, có đồng hồ đếm ngược 60 giây mỗi câu. Hết giờ tự động chuyển câu. Kết thúc thi hiển thị điểm số và danh sách câu đúng (màu xanh)/câu sai (màu đỏ).
[Style]: Giao diện Dark Mode + hiệu ứng Glassmorphism hiện đại, sử dụng gam màu thương hiệu VietIS (Teal & Orange).`;
addBox(slide4, 0.5, 2.0, 9.0, 3.2, "💻", "Prompt mẫu RCESF:", prompt4, LIGHT_ORANGE, ORANGE, ORANGE);

// ---------------------------------------------------------
// Slide 6: Prompt 5 - Báo cáo dự án IT chuyên nghiệp
let slide5 = pres.addSlide({ masterName: "MASTER_SLIDE" });
addTitle(slide5, "5. Báo Cáo Kỹ Thuật Dự Án (IT Report)", TEAL);
addSubtext(slide5, "Prompt tự động hóa viết tài liệu chuyển giao dự án chuyên nghiệp.");
const prompt5 = `[Role]: Bạn là một Solution Architect kiêm Trưởng dự án phát triển phần mềm (Project Manager).
[Context]: Dựa trên mã nguồn của ứng dụng Web thi trắc nghiệm (file index.html vừa code), hãy viết một báo cáo bàn giao và phân tích dự án chi tiết dành cho Giám đốc công nghệ (CTO).
[Style]: Chuyên nghiệp, mạch lạc, sử dụng các thuật ngữ công nghệ chuẩn hóa (data flow, state management, UI/UX...).
[Format]: Trình bày báo cáo dưới dạng Markdown gồm các mục:
1. Tổng quan dự án: Mục tiêu, kiến trúc.
2. Phân tích thiết kế: Luồng dữ liệu (Data Flow) và Sơ đồ trường hợp sử dụng (Use Case).
3. Đánh giá kỹ thuật: Cách quản lý state thời gian, điểm số và các đề xuất tối ưu hiệu năng.`;
addBox(slide5, 0.5, 2.0, 9.0, 3.2, "📊", "Prompt mẫu RCESF:", prompt5, LIGHT_TEAL, TEAL, TEAL);

// Save the PPTX
const outputPath = path.join(targetDir, 'VietIS_Vibe_Coding_Prompts.pptx');
pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log("PPTX created successfully at: " + outputPath);
  })
  .catch(err => {
    console.error("Error creating PPTX:", err);
  });
