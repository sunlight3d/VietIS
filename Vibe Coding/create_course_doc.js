const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, ImageRun, Header, AlignmentType, PageBreak, HeadingLevel, LevelFormat } = require('docx');

// Theme colors from Tech Innovation
const colorPrimary = "0066FF"; // Electric Blue
const colorAccent = "1E1E1E"; // Dark Gray
const colorLight = "0066FF"; // Using blue instead of cyan for readability on white
const fontHeader = "Arial";
const fontBody = "Arial";

const logoBuffer = fs.readFileSync('logo_vietis.png');
const img1Buffer = fs.readFileSync('C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\744b8bab-50a0-49cf-bef1-d6c52c3a4ec1\\ai_productivity_1782446182774.png');
const img2Buffer = fs.readFileSync('C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\744b8bab-50a0-49cf-bef1-d6c52c3a4ec1\\vibe_coding_1782446195266.png');
const img3Buffer = fs.readFileSync('C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\744b8bab-50a0-49cf-bef1-d6c52c3a4ec1\\ai_learning_1782446205909.png');

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: fontBody, size: 24, color: "000000" } // 12pt default
      }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: fontHeader, color: colorPrimary },
        paragraph: { spacing: { before: 400, after: 300 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: fontHeader, color: colorAccent },
        paragraph: { spacing: { before: 300, after: 200 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: fontHeader, color: colorLight },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 }, // US Letter
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new ImageRun({
                type: "png",
                data: logoBuffer,
                transformation: { width: 150, height: 50 }, // Approximation for a logo size
                altText: { title: "VietIS Logo", description: "VietIS Logo", name: "VietIS" }
              })
            ]
          })
        ]
      })
    },
    children: [
      // Page 1
      new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun("KHÓA HỌC 2 GIỜ")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER, children: [new TextRun("ỨNG DỤNG AI NÂNG CAO HIỆU SUẤT CHO NGƯỜI ĐI LÀM!")] }),
      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({ children: [new TextRun("Cộng đồng phổ cập AI cùng VietIS Education trân trọng mang đến chương trình đào tạo đặc biệt, giúp anh chị x5 hiệu suất làm việc mỗi ngày thông qua sức mạnh của trí tuệ nhân tạo!")] }),
      new Paragraph({ spacing: { before: 400 } }),
      
      // Image 1
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [new ImageRun({
          type: "png",
          data: img1Buffer,
          transformation: { width: 400, height: 400 },
          altText: { title: "AI Productivity", description: "AI Productivity", name: "AI Productivity" }
        })]
      }),

      new Paragraph({ children: [new TextRun({ text: "Trong kỷ nguyên số, AI không chỉ là công cụ mà còn là người trợ lý đắc lực, giúp chúng ta giải phóng thời gian khỏi những công việc lặp đi lặp lại và tập trung vào những giá trị cốt lõi. Khóa học này được thiết kế dành riêng cho người đi làm, với mục tiêu mang lại hiệu quả tức thì và tính ứng dụng cao.", italics: true })] }),
      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({ children: [new TextRun("Hãy chuẩn bị sẵn sàng để khám phá những tiềm năng vô hạn của bản thân khi được trợ lực bởi AI!")] }),
      new Paragraph({ children: [new PageBreak()] }),

      // Page 2
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("GIÁ TRỊ BUỔI HỌC (PHẦN 1)")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1. Nắm Bắt Công Cụ AI Hàng Đầu")] }),
      new Paragraph({ children: [new TextRun("Học viên sẽ được hướng dẫn thực chiến cách ứng dụng các công cụ AI và AI Agent phổ biến và mạnh mẽ nhất hiện nay:")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Google Gemini Pro: ", bold: true }), new TextRun("Sử dụng Gemini để tạo ra nội dung sáng tạo, phân tích dữ liệu, và giải quyết các bài toán phức tạp hàng ngày.")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Google Antigravity: ", bold: true }), new TextRun("Trải nghiệm sức mạnh của agentic AI để tự động hóa những chuỗi quy trình làm việc kéo dài.")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "NotebookLM: ", bold: true }), new TextRun("Khai thác sức mạnh của trợ lý nghiên cứu cá nhân, phân tích và tóm tắt một lượng lớn tài liệu, báo cáo nhanh chóng.")] }),
      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2. Tự Động Hóa Công Việc")] }),
      new Paragraph({ children: [new TextRun("Một trong những giá trị cốt lõi là khả năng tự động hóa, giúp bạn giảm tải tác vụ lặp đi lặp lại:")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Tổng hợp tin tức và yêu cầu tuyển dụng một cách nhanh chóng và chính xác nhất.")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Soạn thảo CV và thư xin việc chuyên nghiệp, ấn tượng, may đo phù hợp với từng vị trí công việc cụ thể.")] }),
      
      // Image 2
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
        children: [new ImageRun({
          type: "png",
          data: img2Buffer,
          transformation: { width: 400, height: 400 },
          altText: { title: "Vibe Coding", description: "Vibe Coding", name: "Vibe Coding" }
        })]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // Page 3
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("GIÁ TRỊ BUỔI HỌC (PHẦN 2)")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3. Vibe Coding Đỉnh Cao")] }),
      new Paragraph({ children: [new TextRun("Đây là một trong những nội dung độc quyền và hấp dẫn nhất của chương trình. Không cần có kiến thức nền tảng về lập trình, bạn vẫn có thể tự tạo ra các sản phẩm công nghệ ấn tượng:")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Từ tài liệu có sẵn, sử dụng AI để sinh mã nguồn (code) hoàn toàn tự động.")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Tạo ngay một App thi trắc nghiệm hoàn chỉnh, có giao diện đẹp mắt và logic hoạt động chuẩn xác một cách dễ dàng và nhanh chóng.")] }),
      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4. Tối Ưu Quy Trình và Tư Duy")] }),
      new Paragraph({ children: [new TextRun("Bên cạnh việc sử dụng công cụ, khóa học còn giúp bạn phát triển tư duy làm việc hiệu suất cao:")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Tối ưu quy trình: Tự động viết báo cáo dự án chi tiết, trình bày số liệu rõ ràng ngay sau khi hoàn thành App.")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Sở hữu công thức giao tiếp với AI hiệu quả (Prompt Engineering) để đưa ra yêu cầu sắc bén và nhận về kết quả chính xác.")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Xây dựng tư duy ứng dụng AI tối ưu để tạo lợi thế cạnh tranh vượt trội trên con đường phát triển sự nghiệp.")] }),
      new Paragraph({ children: [new PageBreak()] }),

      // Page 4
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("THÔNG TIN CHI TIẾT")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Đội ngũ giảng viên (Trainer)")] }),
      new Paragraph({ children: [new TextRun({ text: "Nguyễn Đức Hoàng", bold: true })] }),
      new Paragraph({ children: [new TextRun("Chuyên gia đào tạo AI và phát triển phần mềm hàng đầu tại VietIS Education. Thầy Hoàng đã có nhiều năm kinh nghiệm trong việc áp dụng AI vào quy trình sản xuất phần mềm thực tế và đào tạo cho hàng trăm kỹ sư, nhân sự phi công nghệ đạt hiệu quả cao.")] }),
      new Paragraph({ spacing: { before: 400 } }),
      
      // Image 3
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 400 },
        children: [new ImageRun({
          type: "png",
          data: img3Buffer,
          transformation: { width: 350, height: 350 },
          altText: { title: "AI Learning", description: "AI Learning", name: "AI Learning" }
        })]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Thông tin tổ chức (Logistics)")] }),
      new Paragraph({ children: [new TextRun({ text: "Thời gian:", bold: true }), new TextRun(" (Sẽ cập nhật thời gian cụ thể tới từng học viên đã đăng ký)")] }),
      new Paragraph({ children: [new TextRun({ text: "Hình thức học:", bold: true }), new TextRun(" Online qua Zoom - Tương tác trực tiếp cùng giảng viên.")] }),
      new Paragraph({ spacing: { before: 600 } }),
      new Paragraph({ children: [new TextRun({ text: "Lời kết:", bold: true, color: colorPrimary })] }),
      new Paragraph({ children: [new TextRun({ text: "Đừng bỏ lỡ cơ hội bứt phá trong sự nghiệp! Hãy tham gia ngay để trang bị cho mình bộ kỹ năng làm việc của tương lai và trở thành người tiên phong trong việc ứng dụng AI vào công việc thực tế.", color: colorPrimary, italics: true })] }),
      new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "VietIS Education - Chắp cánh tương lai số", bold: true, color: colorAccent })] })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("Nội dung khóa học 2h - Viber coding.docx", buffer);
  console.log("Document generated successfully!");
}).catch(err => {
  console.error("Error generating document:", err);
});
