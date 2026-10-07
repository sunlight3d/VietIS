# TEST SUITE 03: CHẾ ĐỘ THI THỬ & TƯƠNG TÁC TRỢ LÝ AI CHATBOT (FLOW 03)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Flow 03 (`exam-app/flows/03-thi-thu-ai-chatbot.md`), Lược đồ CSDL v2.4 bảng `exam_configs`, `exam_attempts`, `ai_chat_logs`, RPC `fn_start_exam`, `fn_save_answer`, `fn_submit_exam_attempt`.  
> **Mục tiêu:** Kiểm thử chế độ tự học/thi thử không áp lực thời gian, kết xuất công thức LaTeX chuẩn xác, cơ chế phản hồi đúng/sai chống lộ đáp án đối với câu hỏi nhiều lựa chọn, tương tác hỏi đáp chuyên sâu với Chatbot AI (lưu vết `ai_chat_logs`), và lưu kết quả thi thử vào lịch sử/thống kê học tập.  
> **Tổng số Test Cases:** 8 (2 P0, 4 P1, 2 P2)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Loại Kiểm Thử | Độ Ưu Tiên | Kết Quả Mong Đợi Tóm Tắt |
| :--- | :--- | :--- | :---: | :--- |
| **TC-PRAC-01** | Bắt đầu lượt thi thử qua RPC `fn_start_exam(mode: 'practice')` | Functional / RPC | **P0** | Lượt thi tạo thành công, bốc ngẫu nhiên câu hỏi, không áp đặt đếm lùi tự nộp |
| **TC-PRAC-02** | Kết xuất công thức Hóa học, Sinh học, Toán học bằng LaTeX | UI / Rendering | **P1** | Các công thức $Fe + 2HCl \rightarrow FeCl_2 + H_2$ hiển thị đẹp mắt, không lỗi cú pháp |
| **TC-PRAC-03** | Chọn câu hỏi đơn đáp án (Radio) & Phản hồi tức thì | Functional | **P1** | Gọi `fn_save_answer`, phát sáng Xanh (Đúng) hoặc Đỏ (Sai) kèm hiện lời giải ngay |
| **TC-PRAC-04** | Chống lộ đáp án câu nhiều lựa chọn (Checkbox) | Security / UI Logic | **P0** | Tích chọn các ô không đổi màu trước; chỉ phản hồi khi bấm nút "Kiểm tra đáp án" |
| **TC-PRAC-05** | Tương tác hỏi đáp Trợ lý AI Chatbot giải thích bài làm | Integration / AI | **P1** | Chatbot AI tiếp nhận ngữ cảnh đề bài, giải thích cặn kẽ bản chất học thuật |
| **TC-PRAC-06** | Lưu vết lịch sử trò chuyện AI vào bảng `ai_chat_logs` | Data Persistence | **P1** | Bản ghi lưu đầy đủ `attempt_id`, `question_id`, `user_message`, `ai_response` |
| **TC-PRAC-07** | Hoàn tất buổi thi thử và chấm điểm qua `fn_submit_exam_attempt` | Functional / RPC | **P1** | Chấm điểm tự động, cập nhật trạng thái `completed`, hiển thị bảng tổng kết |
| **TC-PRAC-08** | Xác minh bài thi thử được ghi nhận vào Lịch sử cá nhân và Thống kê | Business Rules | **P2** | Bài thi thử xuất hiện trong lịch sử thi cá nhân và được tính vào thống kê học lực |

---

### CHI TIẾT CÁC TEST CASES

#### TC-PRAC-01: Bắt đầu lượt thi thử qua RPC `fn_start_exam(mode: 'practice')`
* **Mục tiêu:** Xác minh học sinh khởi tạo thành công lượt thi thử thông qua RPC bảo mật, tự động bốc câu hỏi từ ngân hàng đề mà không bị giới hạn thời gian tự nộp bài.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:** Học sinh A đăng nhập. Môn Hóa học có cấu hình `CONFIG_CHEM` đang hoạt động (`is_active = true`).
* **Các bước thực hiện:**
  1. Học sinh bấm nút **"Thi Thử - Học cùng AI"** ở môn Hóa học.
  2. Frontend gọi RPC:
     ```javascript
     const { data, error } = await supabase.rpc('fn_start_exam', {
       p_exam_config_id: 'CONFIG_CHEM',
       p_mode: 'practice'
     });
     ```
* **Kết quả mong đợi:**
  - RPC trả về thành công: `{ success: true, attempt_id: 'ATTEMPT_PRACTICE_01', total_questions: 20 }`.
  - CSDL `exam_attempts`: Tạo 1 bản ghi với `status = 'in_progress'`, `exam_type = 'practice'`.
  - CSDL `exam_attempt_answers`: Được tự động nạp sẵn 20 câu hỏi ngẫu nhiên từ kho đề Hóa học.
  - Giao diện phòng thi thử: Không có đồng hồ đếm lùi tự động khóa màn hình.

---

#### TC-PRAC-02: Kết xuất công thức Hóa học, Sinh học, Toán học bằng LaTeX
* **Mục tiêu:** Kiểm tra trình kết xuất toán học/hóa học KaTeX hiển thị chính xác các ký tự đặc biệt, chỉ số trên/dưới và phương trình phản ứng.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Ngân hàng đề có các câu hỏi chứa công thức LaTeX:
  - Hóa học: `$2Al + 6HCl \rightarrow 2AlCl_3 + 3H_2\uparrow$`
  - Sinh học: Di truyền phân ly độc lập `$P: AaBb \times AaBb \rightarrow F_1: 9:3:3:1$`
* **Các bước thực hiện:**
  1. Mở câu hỏi có chứa công thức LaTeX trong phòng thi thử.
  2. Quan sát trực quan màn hình hiển thị.
* **Kết quả mong đợi:**
  - Toàn bộ công thức hiển thị sắc nét dưới dạng ký hiệu toán học/hóa học chuẩn xác, không bị hiển thị chuỗi mã nguồn thô (raw text `$..$`), không bị lỗi vỡ layout hoặc ký tự lạ.

---

#### TC-PRAC-03: Chọn câu hỏi đơn đáp án (Radio) & Phản hồi tức thì
* **Mục tiêu:** Kiểm tra trải nghiệm học tập phản hồi nhanh trên câu hỏi chọn 1 phương án duy nhất.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Câu hỏi số 1 là câu hỏi trắc nghiệm đơn đáp án (`question_type = 'single_choice'`).
* **Các bước thực hiện:**
  1. Học sinh click chọn phương án B.
  2. Quan sát network request và giao diện phản hồi.
* **Kết quả mong đợi:**
  - Frontend gọi RPC: `fn_save_answer(p_attempt_id, question_id, [option_b_id])` để lưu lựa chọn.
  - Nếu phương án B là đúng: Ô B phát sáng màu XANH LÁ, có icon tích xanh [✓].
  - Nếu phương án B là sai: Ô B đổi sang màu ĐỎ có icon [X], đồng thời đáp án đúng thật sự phát sáng XANH LÁ.
  - Khung "Lời giải thích chi tiết" mở ra ngay bên dưới câu hỏi.

---

#### TC-PRAC-04: Chống lộ đáp án câu nhiều lựa chọn (Checkbox)
* **Mục tiêu:** Xác minh khắc phục triệt để lỗi logic Flow 03: Chống lộ đáp án câu hỏi chọn nhiều đáp án trước khi học sinh hoàn tất lựa chọn.
* **Độ ưu tiên:** P0 (Critical Logic)
* **Tiền điều kiện:** Câu hỏi số 2 là câu hỏi nhiều đáp án đúng (`question_type = 'multiple_choice'`), có 4 lựa chọn A, B, C, D (Đáp án đúng là A và C).
* **Các bước thực hiện:**
  1. Học sinh click chọn ô A -> Quan sát màu sắc.
  2. Học sinh click tiếp ô B -> Quan sát màu sắc.
  3. Học sinh bấm nút **"✓ Kiểm tra đáp án"**.
* **Kết quả mong đợi:**
  - Ở bước 1 và 2: Các ô chỉ hiển thị trạng thái đã tích chọn (Checkbox checked), TUYỆT ĐỐI KHÔNG phát sáng xanh hay đỏ, không báo đúng/sai để tránh lộ kết quả các ô còn lại.
  - Ở bước 3: Sau khi bấm "Kiểm tra đáp án":
    - Hệ thống gọi `fn_save_answer` lưu cả 2 phương án đã chọn `[option_a_id, option_b_id]`.
    - Ô A phát sáng XANH (đúng).
    - Ô B phát sáng ĐỎ (chọn sai).
    - Ô C phát sáng XANH (đáp án đúng bị bỏ sót).
    - Mở ô giải thích chi tiết phía dưới.

---

#### TC-PRAC-05: Tương tác hỏi đáp Trợ lý AI Chatbot giải thích bài làm
* **Mục tiêu:** Xác minh tính năng gọi Chatbot AI trợ giảng khi học sinh chưa hiểu rõ lời giải đề bài.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Học sinh đang ở câu hỏi Hóa học số 3 và đã bấm xem lời giải.
* **Các bước thực hiện:**
  1. Bấm nút **"🤖 Hỏi Trợ lý AI"**.
  2. Cửa sổ chat pop-up mở ra ở cạnh phải màn hình, tự động đính kèm ngữ cảnh đề bài.
  3. Học sinh nhập câu hỏi: "Tại sao Fe tác dụng với HCl chỉ lên Fe(II) mà tác dụng với Cl2 lại lên Fe(III)?" -> Bấm Gửi.
* **Kết quả mong đợi:**
  - Khung chat hiển thị chỉ báo đang suy nghĩ (Typing indicator) dưới 2 giây.
  - AI phản hồi giải thích khoa học, chính xác: Do tính oxi hóa của axit HCl ($H^+$) yếu chỉ đưa Fe lên mức oxi hóa +2, trong khi khí Clo ($Cl_2$) là chất oxi hóa rất mạnh đưa Fe lên mức oxi hóa cao nhất +3.

---

#### TC-PRAC-06: Lưu vết lịch sử trò chuyện AI vào bảng `ai_chat_logs`
* **Mục tiêu:** Xác minh hệ thống lưu trữ đầy đủ nhật ký tương tác AI phục vụ kiểm duyệt nội dung và phân tích hành vi học tập.
* **Độ ưu tiên:** P1 (Data Integrity)
* **Các bước thực hiện:**
  1. Sau khi hoàn thành phiên chat ở TC-PRAC-05, kiểm tra CSDL bảng `public.ai_chat_logs`.
* **Kết quả mong đợi:**
  - Có 1 bản ghi mới trong bảng `ai_chat_logs` với:
    - `attempt_id`: UUID của lượt thi thử hiện tại.
    - `question_id`: UUID của câu hỏi số 3.
    - `user_id`: UUID của học sinh A.
    - `user_message`: "Tại sao Fe tác dụng với HCl chỉ lên Fe(II)..."
    - `ai_response`: Nội dung phản hồi của AI.
    - `created_at`: Thời điểm gửi tin nhắn.

---

#### TC-PRAC-07: Hoàn tất buổi thi thử và chấm điểm qua `fn_submit_exam_attempt`
* **Mục tiêu:** Xác minh quy trình kết thúc bài thi thử, chấm điểm và thống kê kết quả.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Học sinh hoàn thành 20 câu thi thử (hoặc bấm nút "Kết thúc ôn luyện").
  2. Bấm nút **"Hoàn thành bài thi"**.
  3. Frontend gọi RPC: `fn_submit_exam_attempt(p_attempt_id, p_answers, false)`.
* **Kết quả mong đợi:**
  - RPC trả về kết quả chấm điểm thành công: `{ success: true, score: 8.5, correct_count: 17, total_questions: 20, is_passed: true }`.
  - Trạng thái lượt thi cập nhật `status = 'completed'`.
  - Giao diện chuyển sang Bảng tổng kết buổi luyện tập: Số câu đúng 17/20, Điểm số 8.5đ, kèm nút "Xem lại chi tiết" và "Luyện đề khác".

---

#### TC-PRAC-08: Xác minh bài thi thử được ghi nhận vào Lịch sử cá nhân và Thống kê
* **Mục tiêu:** Đảm bảo thực thi đúng quyết định nghiệp vụ của Stakeholder: "Bài thi thử CÓ được tính vào lịch sử và thống kê học tập".
* **Độ ưu tiên:** P2 (Business Rule)
* **Các bước thực hiện:**
  1. Vào tab "Lịch sử làm bài" của học sinh A -> Kiểm tra sự xuất hiện của bài thi thử vừa hoàn thành.
  2. Truy cập bảng thống kê `view_class_performance` của lớp 10A1.
* **Kết quả mong đợi:**
  - Bài thi thử xuất hiện trong danh sách Lịch sử cá nhân với nhãn phân loại: "Thi Thử".
  - Thống kê `view_class_performance` phản ánh đúng số lượt thi thử và điểm trung bình của học sinh lớp 10A1.
