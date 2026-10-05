# FLOW 03: Chế độ Thi Thử & Tương tác Trợ lý Chatbot AI

**Độ phức tạp:** Trung bình  
**Tác nhân chính (Actors):** Học viên (Student)  
**Mục tiêu (Purpose):** Cung cấp không gian tự học và ôn luyện không áp lực thời gian. Hệ thống phản hồi đáp án chuẩn xác (với câu hỏi nhiều đáp án: phản hồi sau khi bấm "Kiểm tra đáp án" để chống lộ đáp án trước), kèm theo lời giải chi tiết và tính năng tương tác với Trợ lý AI Chatbot để giải thích cặn kẽ bản chất học thuật của câu hỏi.  

---

## 1. Sơ đồ Quy trình (Flowchart)

```mermaid
flowchart TD
    Start([Học viên chọn Môn thi: Hóa / Sinh / Anh]) --> ChooseMode[Chọn Chế độ: 'THI THỬ']
    ChooseMode --> FetchPractice[Hệ thống nạp 20 câu hỏi ngẫu nhiên kèm đáp án & lời giải]
    FetchPractice --> RenderQ[Hiển thị câu hỏi + Công thức LaTeX + Các phương án]
    
    RenderQ --> CheckQType{Loại câu hỏi?}
    
    CheckQType -->|Đơn đáp án - Radio| SelectSingle[Học viên chọn 1 đáp án]
    SelectSingle --> InstantFeedback
    
    CheckQType -->|Nhiều đáp án - Checkbox| SelectMulti[Học viên tích chọn các phương án]
    SelectMulti --> ClickVerify[Học viên bấm nút 'Kiểm tra đáp án']
    ClickVerify --> InstantFeedback
    
    InstantFeedback{Hệ thống Đánh giá & Phản hồi}
    InstantFeedback --> HighlightGreen[Đáp án Đúng: PHÁT SÁNG XANH LÁ]
    InstantFeedback --> HighlightRed[Đáp án Chọn Sai: HIỆN ICON DẤU X ĐỎ]
    HighlightGreen --> ShowExplain[Hiện ngay Lời giải thích chi tiết phía dưới]
    HighlightRed --> ShowExplain
    
    ShowExplain --> AskAIChoice{Học viên có thắc mắc thêm?}
    AskAIChoice -->|Không| NextQuestion[Bấm 'Câu tiếp theo' -> Tiếp tục luyện tập]
    AskAIChoice -->|Có| OpenAIChat[Bấm nút 'Hỏi Trợ lý AI']
    
    OpenAIChat --> TypePrompt[Gõ câu hỏi: 'Tại sao chất X không tác dụng với Y?']
    TypePrompt --> AICall[Hệ thống gửi câu hỏi + Ngữ cảnh đề bài lên AI Model]
    AICall --> AIResponse[Chatbot AI diễn giải cặn kẽ bản chất học thuật]
    AIResponse --> NextQuestion
    NextQuestion --> CheckFinished{Đã hết 20 câu?}
    CheckFinished -->|Chưa| RenderQ
    CheckFinished -->|Đã xong| SummaryView[Hiển thị Bảng tổng kết buổi luyện tập]
```

---

## 2. Mô tả Chi tiết Từng bước (Step-by-Step Execution)

### Bước 1: Chọn môn học và bắt đầu chế độ Thi Thử
* **Tác nhân thực hiện:** Học viên (Khởi động)
* **Mô tả chi tiết:** Học viên lựa chọn môn học (Hóa học, Sinh học hoặc Tiếng Anh) và bấm nút 'Luyện tập / Thi Thử'.
* **Giao diện trực quan (UI View):** Nút chọn chế độ với icon bóng đèn/mũ cử nhân và nhãn 'Thi Thử - Học cùng AI'.

### Bước 2: Hiển thị câu hỏi và công thức Toán - Lý - Hóa
* **Tác nhân thực hiện:** Hệ thống (Nạp đề)
* **Mô tả chi tiết:** Hệ thống hiển thị câu hỏi với đầy đủ công thức hóa học, chỉ số trên/dưới, ký hiệu di truyền hoặc phiên âm tiếng Anh thông qua trình kết xuất LaTeX.
* **Giao diện trực quan (UI View):** Khung câu hỏi đẹp mắt: công thức $Fe + 2HCl \rightarrow FeCl_2 + H_2\uparrow$ hiển thị chuẩn xác.

### Bước 3: Lựa chọn phương án trả lời & Cơ chế Kiểm tra chống lộ đáp án
* **Tác nhân thực hiện:** Học viên (Thao tác)
* **Mô tả chi tiết:**
  - **Với câu hỏi 1 đáp án (Radio):** Học viên chọn một đáp án, hệ thống lập tức hiển thị kết quả đúng/sai.
  - **Với câu hỏi nhiều đáp án (Checkbox):** Học viên tích chọn các phương án theo suy đoán. Hệ thống **chưa hiển thị kết quả ngay** (để chống lộ đáp án của các ô còn lại). Học viên hoàn tất lựa chọn rồi bấm nút **"Kiểm tra đáp án"** để xem đánh giá toàn diện.
* **Giao diện trực quan (UI View):** Ô lựa chọn có hover mượt mà; câu nhiều đáp án hiển thị nút màu xanh mòng két "Kiểm tra đáp án".

### Bước 4: Phản hồi trực quan & Hiển thị giải thích
* **Tác nhân thực hiện:** Hệ thống (Phản hồi trực quan)
* **Mô tả chi tiết:** Khi kiểm tra: các phương án đúng phát sáng màu xanh lá; các phương án thí sinh chọn sai hiển thị icon [X] đỏ. Khung giải thích chi tiết mở ra ngay phía dưới.
* **Giao diện trực quan (UI View):** Phương án đúng: viền xanh lá, nền xanh nhạt rực sáng. Phương án sai: viền đỏ + icon [X] đỏ.

### Bước 5: Hỏi đáp chuyên sâu với Trợ lý Chatbot AI
* **Tác nhân thực hiện:** Học viên & AI Chatbot (Tương tác AI)
* **Mô tả chi tiết:** Nếu chưa hiểu bản chất lời giải, học viên bấm 'Hỏi Trợ lý AI'. Một cửa sổ chat pop-up mở ra, học viên nhập thắc mắc mở, AI giải đáp cặn kẽ bản chất học thuật.
* **Giao diện trực quan (UI View):** Cửa sổ chat pop-up bên phải màn hình. AI diễn giải chi tiết kèm ví dụ thực tế.

---

## 3. Quy tắc Nghiệp vụ Cần Ghi nhớ (Business Rules)

* **Không áp lực thời gian:** Chế độ Thi Thử không đếm ngược tự nộp bài.
* **Chống lộ đáp án câu nhiều lựa chọn:** Tuyệt đối không phản hồi màu sắc từng ô khi học sinh chưa bấm "Kiểm tra đáp án" đối với câu multi-choice.
* **Tự động gợi ý AI:** Lời giải thích luôn đi kèm nút kích hoạt Chatbot AI được nạp sẵn ngữ cảnh câu hỏi hiện tại.
