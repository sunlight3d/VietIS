# TEST SUITE 04: CHẾ ĐỘ THI THẬT, AUTO-SAVE & TỰ ĐỘNG THU BÀI (FLOW 04)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Flow 04 (`exam-app/flows/04-thi-that-tu-dong-nop-bai.md`), Lược đồ CSDL v2.4 bảng `exam_attempts`, `exam_attempt_answers`, RPC `fn_start_exam`, `fn_save_answer`, `fn_submit_exam_attempt`, `fn_get_attempt_review`.  
> **Mục tiêu:** Kiểm thử toàn diện quy trình tổ chức thi chính quy nghiêm ngặt, khóa 100% quyền ghi trực tiếp trên bảng, thẩm định thời gian Server-side chống gian lận hết giờ (H4), bảo mật chống F12 soi đáp án (H3), chống sửa điểm (H1) và chống can thiệp số câu (H2), tự động thu bài khi hết giờ và chấm điểm chuẩn xác.  
> **Tổng số Test Cases:** 12 (7 P0, 4 P1, 1 P2)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Loại Kiểm Thử | Độ Ưu Tiên | Kết Quả Mong Đợi Tóm Tắt |
| :--- | :--- | :--- | :---: | :--- |
| **TC-REAL-01** | Bắt đầu lượt thi thật qua RPC `fn_start_exam(mode: 'real')` | Functional / Security | **P0** | Lượt thi tạo thành công, bốc đề ngẫu nhiên, cố định số câu và mốc `started_at` |
| **TC-REAL-02** | Khóa direct INSERT trên `exam_attempts` khi học sinh cố tạo bài thi trực tiếp | Security / RLS (H1/H2) | **P0** | PostgreSQL RLS chặn đứng 100% (Mã lỗi 42501 / HTTP 403 Forbidden) |
| **TC-REAL-03** | Bảo mật chống F12 (H3): Kiểm tra payload đề thi không chứa đáp án đúng | Security / Anti-F12 | **P0** | API đề thi giấu hoàn toàn `is_correct` và `explanation`, không lưu trong DOM/JS |
| **TC-REAL-04** | Lưu tiến độ thời gian thực qua RPC `fn_save_answer` khi còn trong giờ thi | Functional / RPC | **P1** | Cập nhật `selected_option_ids` và `time_spent_seconds` thành công |
| **TC-REAL-05** | Chống gian lận quá giờ (H4): Gửi lưu câu trả lời sau khi thời gian thi đã kết thúc | Security / Anti-Cheat | **P0** | Server từ chối lưu bài, tự động chuyển `status = 'timed_out'`, Raise Exception |
| **TC-REAL-06** | Thử nghiệm chỉnh lùi đồng hồ máy khách (Client clock skew) để gian lận giờ | Security / Anti-Cheat | **P0** | Bị vô hiệu hóa vì hệ thống tính giờ dựa trên `now()` máy chủ PostgreSQL |
| **TC-REAL-07** | Học sinh hoàn thành sớm và bấm nút "Nộp bài" chủ động | Functional | **P1** | Modal xác nhận, gọi `fn_submit_exam_attempt(auto_submitted: false)`, chấm điểm |
| **TC-REAL-08** | Đồng hồ đếm ngược về 00:00: Tự động đóng băng UI và tự nộp bài | Functional / Timeout | **P0** | Vô hiệu hóa click chuột/phím, tự gọi `fn_submit_exam_attempt(auto_submitted: true)` |
| **TC-REAL-09** | Chống hack điểm tuyệt đối (H1): Thử gửi payload chấm điểm `score = 10` từ client | Security / Grading | **P0** | Server phớt lờ điểm client, tự động chấm theo số câu đúng thực tế trên DB |
| **TC-REAL-10** | Chống hack bỏ trống câu hỏi: Thí sinh bỏ trắng toàn bộ đề thi | Functional / Grading | **P1** | Điểm = 0.0đ (chia cho `total_questions`), không bị chia cho số câu đã trả lời |
| **TC-REAL-11** | Bảo toàn điểm số cho bài thi tự nộp (`timed_out`) | Data Integrity | **P1** | Bài tự nộp vẫn được chấm đầy đủ điểm các câu đã lưu và hiển thị trên bảng xếp hạng |
| **TC-REAL-12** | Xem lại bài thi sau khi nộp thành công qua `fn_get_attempt_review` | Functional / Post-Exam | **P2** | Sau khi nộp thành công mới mở quyền xem chi tiết đáp án chuẩn và lời giải |

---

### CHI TIẾT CÁC TEST CASES

#### TC-REAL-01: Bắt đầu lượt thi thật qua RPC `fn_start_exam(mode: 'real')`
* **Mục tiêu:** Khởi tạo phiên thi thật chính quy, cố định các tham số bất biến trên máy chủ.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:** Học sinh A đăng nhập. Đề thi Giữa kỳ 1 Môn Sinh học (`CONFIG_BIO_MIDTERM`) có: `duration_minutes = 45`, `total_questions = 30`, `pass_score = 5.0`.
* **Các bước thực hiện:**
  1. Học sinh bấm nút **"BẮT ĐẦU THI THẬT"**.
  2. Frontend gọi RPC:
     ```javascript
     const { data, error } = await supabase.rpc('fn_start_exam', {
       p_exam_config_id: 'CONFIG_BIO_MIDTERM',
       p_mode: 'real'
     });
     ```
* **Kết quả mong đợi:**
  - RPC khởi tạo thành công lượt thi:
    - `id`: UUID lượt thi mới.
    - `started_at`: Ghi nhận mốc thời gian máy chủ `now()`.
    - `duration_minutes`: 45 phút.
    - `total_questions`: Cố định 30 câu.
    - `pass_score`: Cố định 5.0 điểm.
    - `status`: `'in_progress'`.
  - Bảng `exam_attempt_answers`: Tự động nạp sẵn 30 câu hỏi ngẫu nhiên từ kho đề Sinh học.

---

#### TC-REAL-02: Khóa direct INSERT trên `exam_attempts` khi học sinh cố tạo bài thi trực tiếp
* **Mục tiêu:** Xác minh triệt tiêu nguy cơ học sinh dùng REST API chèn bài thi có sẵn điểm 10 hoặc can thiệp `total_questions = 1` (Lỗ hổng H1 & H2).
* **Độ ưu tiên:** P0 (Critical Security)
* **Tiền điều kiện:** Học sinh A có token đăng nhập hợp lệ.
* **Các bước thực hiện:**
  1. Học sinh gửi request HTTP POST trực tiếp đến bảng `exam_attempts`:
     ```javascript
     const { data, error } = await supabase
       .from('exam_attempts')
       .insert({
         user_id: user.id,
         exam_config_id: 'CONFIG_BIO_MIDTERM',
         score: 10.0,
         is_passed: true,
         total_questions: 1,
         status: 'completed'
       });
     ```
* **Kết quả mong đợi:**
  - PostgreSQL RLS Policy `exam_attempts_insert_admin` kích hoạt và từ chối yêu cầu.
  - Lệnh trả về mã lỗi HTTP 403 Forbidden hoặc lỗi PostgreSQL `42501 (new row violates row-level security policy for table "exam_attempts")`.
  - Không có bất kỳ bản ghi gian lận nào được tạo trong CSDL.

---

#### TC-REAL-03: Bảo mật chống F12 (H3): Kiểm tra payload đề thi không chứa đáp án đúng
* **Mục tiêu:** Xác minh việc phòng thi giấu hoàn toàn đáp án đúng, thí sinh mở DevTools F12 (Network / Elements / Storage / Console) không thể tìm thấy đáp án trước khi nộp bài.
* **Độ ưu tiên:** P0 (Critical Security)
* **Tiền điều kiện:** Học sinh A đang trong phòng thi thật ở lượt thi vừa tạo.
* **Các bước thực hiện:**
  1. Mở Chrome DevTools (phím F12), chuyển sang tab **Network**.
  2. Bắt gói tin phản hồi của API nạp câu hỏi (`fn_get_exam_questions` hoặc query options).
  3. Kiểm tra toàn bộ JSON payload và DOM Elements trên trang.
  4. Thử truy vấn bảng `question_options` bằng Supabase client trên console.
* **Kết quả mong đợi:**
  - Trong gói tin JSON: Mỗi phương án chỉ có `id` và `option_text`. Cột `is_correct` và `explanation` hoàn toàn VẮNG MẶT.
  - Thử chạy lệnh `await supabase.from('question_options').select('is_correct')`: Cột `is_correct` trả về `null` hoặc bị Policy RLS từ chối truy xuất giá trị thực tế.

---

#### TC-REAL-04: Lưu tiến độ thời gian thực qua RPC `fn_save_answer` khi còn trong giờ thi
* **Mục tiêu:** Xác minh tính năng Auto-save lưu câu trả lời mượt mà, chống mất bài nếu mạng chập chờn.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Bài thi đã bắt đầu được 5 phút (thời gian làm bài còn 40 phút).
* **Các bước thực hiện:**
  1. Học sinh chọn phương án cho câu hỏi số 1 (ID: `QUESTION_01`, Lựa chọn: `OPTION_B`).
  2. Hệ thống gọi RPC:
     ```javascript
     const { data, error } = await supabase.rpc('fn_save_answer', {
       p_attempt_id: attemptId,
       p_question_id: 'QUESTION_01',
       p_selected_option_ids: ['OPTION_B']
     });
     ```
* **Kết quả mong đợi:**
  - RPC trả về `{ success: true, question_id: 'QUESTION_01', time_spent_seconds: 300 }`.
  - CSDL `exam_attempt_answers`: Cột `selected_option_ids` được cập nhật `['OPTION_B']`.
  - CSDL `exam_attempts`: Cột `time_spent_seconds` được cập nhật tương ứng.
  - Ma trận câu hỏi bên cạnh: Ô số 1 đổi màu xanh ngọc biểu thị "Đã lưu".

---

#### TC-REAL-05: Chống gian lận quá giờ (H4): Gửi lưu câu trả lời sau khi thời gian thi đã kết thúc
* **Mục tiêu:** Xác minh cơ chế thẩm định Server-side timer trên PostgreSQL đóng chặt lỗ hổng H4: Chặn đứng hành vi gửi đáp án khi đã hết thời gian thi quy định.
* **Độ ưu tiên:** P0 (Critical Security)
* **Tiền điều kiện:** Bài thi có thời lượng 45 phút, `started_at` là `14:00:00`. Thời điểm hiện tại của máy chủ là `14:47:00` (đã quá 45 phút + 60 giây buffer).
* **Các bước thực hiện:**
  1. Thí sinh cố tình gửi request lưu đáp án qua API:
     ```javascript
     await supabase.rpc('fn_save_answer', {
       p_attempt_id: attemptId,
       p_question_id: 'QUESTION_02',
       p_selected_option_ids: ['OPTION_A']
     });
     ```
* **Kết quả mong đợi:**
  - Hàm `fn_save_answer` kiểm tra mốc `EXTRACT(EPOCH FROM (now() - started_at)) > 45 * 60 + 60`.
  - Server lập tức cập nhật trạng thái bài thi: `status = 'timed_out'`, `auto_submitted = true`.
  - Ném ra Exception: `Thời gian làm bài đã kết thúc! Bài thi đã tự động khóa.`
  - Phương án gửi lên KHÔNG ĐƯỢC LƯU vào `exam_attempt_answers`.

---

#### TC-REAL-06: Thử nghiệm chỉnh lùi đồng hồ máy khách (Client clock skew)
* **Mục tiêu:** Xác minh việc chỉnh lùi giờ trên hệ điều hành máy tính của học sinh hoàn toàn vô dụng.
* **Độ ưu tiên:** P0 (Critical Anti-Cheat)
* **Các bước thực hiện:**
  1. Học sinh đang làm bài thi còn 2 phút.
  2. Học sinh vào cài đặt Windows/macOS chỉnh lùi đồng hồ hệ thống về trước 1 tiếng.
  3. Tiếp tục làm bài và chờ đến khi thời gian thực của máy chủ hết giờ.
  4. Gửi lệnh lưu đáp án hoặc nộp bài.
* **Kết quả mong đợi:**
  - Đồng hồ đếm ngược trên web có thể hiển thị sai lệch tạm thời trên UI, nhưng khi gửi request về máy chủ, PostgreSQL sử dụng hàm `now()` của server để tính toán.
  - Máy chủ phát hiện đã quá giờ quy định và từ chối lưu bài. Khẳng định gian lận thất bại 100%.

---

#### TC-REAL-07: Học sinh hoàn thành sớm và bấm nút "Nộp bài" chủ động
* **Mục tiêu:** Xác minh quy trình nộp bài chủ động của thí sinh làm xong sớm.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Học sinh làm xong 30 câu hỏi khi mới qua 25 phút.
  2. Bấm nút **"NỘP BÀI"**.
  3. Modal popup hiển thị: "Bạn đã hoàn thành 30/30 câu hỏi. Bạn có chắc chắn muốn nộp bài sớm?".
  4. Bấm **"Đồng ý Nộp bài"**.
  5. Frontend gọi: `fn_submit_exam_attempt(attemptId, answersArray, false)`.
* **Kết quả mong đợi:**
  - Server thực hiện chấm điểm ngay lập tức.
  - Cập nhật `status = 'completed'`, `auto_submitted = false`, `time_spent_seconds = 1500`.
  - Màn hình chuyển sang trang kết quả thi.

---

#### TC-REAL-08: Đồng hồ đếm ngược về 00:00: Tự động đóng băng UI và tự nộp bài
* **Mục tiêu:** Xác minh tính năng tự động khóa màn hình và tự động nộp bài khi hết giờ.
* **Độ ưu tiên:** P0 (Blocker)
* **Các bước thực hiện:**
  1. Thí sinh làm bài cho đến khi đồng hồ đếm ngược chạm mốc `00:00`.
  2. Quan sát phản ứng của giao diện phòng thi và network request.
* **Kết quả mong đợi:**
  - Ngay tại mốc `00:00`: Toàn bộ các nút chọn phương án bị vô hiệu hóa (disabled).
  - Xuất hiện overlay thông báo: "Đã hết thời gian làm bài! Hệ thống đang tự động nộp bài của bạn...".
  - Frontend tự động phát lệnh gọi RPC `fn_submit_exam_attempt(attemptId, null, true)` với cờ `auto_submitted = true`.
  - Bài thi được ghi nhận trạng thái `status = 'timed_out'` (hoặc `completed` với cờ `auto_submitted = true`).

---

#### TC-REAL-09: Chống hack điểm tuyệt đối (H1): Gửi payload điểm giả từ client
* **Mục tiêu:** Xác minh học sinh không thể gửi điểm 10 lên server để gian lận.
* **Độ ưu tiên:** P0 (Critical Security)
* **Các bước thực hiện:**
  1. Học sinh mở DevTools Console, gửi lệnh nộp bài kèm tham số tự bịa:
     ```javascript
     await supabase.rpc('fn_submit_exam_attempt', {
       p_attempt_id: attemptId,
       p_auto_submitted: false,
       p_fake_score: 10.0 // Cố tình truyền điểm 10
     });
     ```
* **Kết quả mong đợi:**
  - Hàm `fn_submit_exam_attempt` hoàn toàn không nhận tham số điểm số từ bên ngoài.
  - Điểm số `score` được hàm tự động tính bằng cách đếm số câu có đáp án trùng khớp trong bảng `question_options`:
    `v_score := ROUND((v_correct_count::NUMERIC / v_total_questions) * 10, 2);`
  - Nếu học sinh chỉ làm đúng 12/30 câu -> Điểm số lưu trong CSDL bắt buộc là `4.0` điểm.

---

#### TC-REAL-10: Chống hack bỏ trống câu hỏi: Thí sinh bỏ trắng toàn bộ đề thi
* **Mục tiêu:** Xác minh khắc phục lỗi logic: Chống trường hợp thí sinh bỏ trắng 29 câu chỉ làm 1 câu đúng mà được 10 điểm tuyệt đối.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Đề thi có 20 câu (`total_questions = 20`). Thí sinh chỉ trả lời 1 câu số 1 (chọn đúng), bỏ trống 19 câu còn lại.
* **Các bước thực hiện:**
  1. Nộp bài thi.
* **Kết quả mong đợi:**
  - Công thức chấm điểm: `(1 đúng / 20 câu tổng) * 10 = 0.5 điểm`.
  - Kết quả trả về: `score = 0.5`, `is_passed = false`.
  - Tuyệt đối không tính điểm chia cho 1 câu đã trả lời (đạt 10.0 điểm).

---

#### TC-REAL-11: Bảo toàn điểm số cho bài thi tự nộp (`timed_out`)
* **Mục tiêu:** Đảm bảo bài tự nộp do hết giờ vẫn được tính điểm đầy đủ trên các câu đã kịp trả lời và xuất hiện trong bảng xếp hạng.
* **Độ ưu tiên:** P1 (Data Integrity)
* **Tiền điều kiện:** Thí sinh làm được 18/20 câu (trong đó 15 câu đúng), hết giờ và bài thi chuyển sang `timed_out`.
* **Các bước thực hiện:**
  1. Kiểm tra kết quả chấm bài của lượt thi `timed_out`.
  2. Kiểm tra sự xuất hiện của bài thi trong view Bảng xếp hạng `view_leaderboard` và thống kê lớp `view_class_performance`.
* **Kết quả mong đợi:**
  - Điểm số được tính chuẩn xác: `(15 / 20) * 10 = 7.5 điểm`.
  - Bài thi xuất hiện đầy đủ trong Bảng xếp hạng của môn học và danh sách điểm của giáo viên, không bị biến mất.

---

#### TC-REAL-12: Xem lại bài thi sau khi nộp thành công qua `fn_get_attempt_review`
* **Mục tiêu:** Xác minh chỉ sau khi bài thi đã nộp xong (`status IN ('completed', 'timed_out')`), học sinh mới được phép xem đáp án chuẩn và lời giải.
* **Độ ưu tiên:** P2 (Post-Exam)
* **Các bước thực hiện:**
  1. Bước 1: Khi bài thi đang `in_progress`, thử gọi `fn_get_attempt_review` -> Bị từ chối.
  2. Bước 2: Sau khi nộp bài thành công, gọi `fn_get_attempt_review` -> Thành công.
* **Kết quả mong đợi:**
  - Bước 1: Báo lỗi "Bài thi chưa kết thúc, không thể xem lại đáp án!".
  - Bước 2: Hiển thị đầy đủ bảng điểm, đáp án đúng từng câu và giải thích sư phạm chi tiết.
