# TEST SUITE 11: CHUYÊN SÂU BẢO MẬT CSDL, KIỂM THỬ THÂM NHẬP (PENETRATION TEST) & RLS (H1 - H4)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Lược đồ CSDL v2.4 (`exam-app/docs/luoc-do-co-so-du-lieu.md`), Schema SQL `01_schema.sql`, Ma trận Row Level Security (RLS), Bộ 4 RPCs `fn_start_exam`, `fn_save_answer`, `fn_submit_exam_attempt`, `fn_delete_student_attempt`.  
> **Mục tiêu:** Kiểm thử thâm nhập (Pen-test) và kiểm chứng bảo mật đa tầng, xác thực việc đóng triệt để 4 lỗ hổng bảo mật cốt lõi (H1 - Tự sửa điểm, H2 - Hack số câu/điểm đạt, H3 - Soi đáp án F12, H4 - Gian lận sau giờ thi), kiểm thử cô lập dữ liệu giáo viên (Teacher Isolation), bảo mật quyền riêng tư bài thi, và bảo vệ mật khẩu băm.  
> **Tổng số Test Cases:** 10 (8 P0, 2 P1)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Lỗ Hổng Kiểm Chứng | Độ Ưu Tiên | Phương Thức Tấn Công Giả Lập | Kết Quả Mong Đợi |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **TC-SECU-H1-01** | Tấn công chèn bài thi có sẵn điểm 10 qua REST API (`POST /rest/v1/exam_attempts`) | **H1: Tự tạo bài điểm 10** | **P0** | Gửi HTTP POST trực tiếp bằng cURL / Postman với `score = 10.0` | PostgreSQL RLS chặn đứng với lỗi 42501 (HTTP 403 Forbidden) |
| **TC-SECU-H1-02** | Tấn công sửa điểm bài thi đang làm dở qua REST API (`PATCH /rest/v1/exam_attempts`) | **H1: Sửa điểm trực tiếp** | **P0** | Gửi HTTP PATCH `UPDATE exam_attempts SET score = 10, is_passed = true` | PostgreSQL RLS chặn đứng với lỗi 42501 (HTTP 403 Forbidden) |
| **TC-SECU-H2-01** | Tấn công giảm số câu hỏi xuống 1 để hack điểm tuyệt đối khi nộp bài | **H2: Can thiệp total_questions** | **P0** | Gửi HTTP PATCH `SET total_questions = 1, pass_score = 0.0` | Bị RLS chặn 100%, không thể sửa đổi tham số đề thi |
| **TC-SECU-H3-01** | Tấn công soi đáp án đúng bằng DevTools Network hoặc REST query `question_options` | **H3: Lộ đáp án F12** | **P0** | Gửi query `SELECT id, is_correct FROM question_options` từ browser console | Cột `is_correct` bị che giấu hoặc trả về null, API nạp đề không có `is_correct` |
| **TC-SECU-H3-02** | Kiểm chứng payload của RPC lấy đề thi `fn_get_exam_questions` | **H3: Lộ đáp án qua RPC** | **P0** | Gọi `fn_get_exam_questions(attempt_id)` và inspect từng trường JSON | 100% không có trường `is_correct` hay `explanation` trong payload |
| **TC-SECU-H4-01** | Tấn công lưu đáp án sau khi hết thời gian thi trên máy chủ qua `fn_save_answer` | **H4: Gian lận hết giờ** | **P0** | Gọi `fn_save_answer` khi `now() > started_at + duration + 60s` | Server từ chối lưu bài, tự đổi `status = 'timed_out'`, Raise Exception |
| **TC-SECU-H4-02** | Tấn công ghi đè trực tiếp câu trả lời vào bảng `exam_attempt_answers` | **H4: Direct answer write** | **P0** | Gửi HTTP POST / PATCH trực tiếp vào `exam_attempt_answers` | Bị RLS chặn 100%, buộc phải ghi qua RPC có kiểm tra timer |
| **TC-SECU-RLS-01** | Tấn công truy xuất chéo môn học: Giáo viên môn Hóa query dữ liệu môn Sinh | **RLS: Teacher Scope** | **P0** | Giáo viên Hóa gửi query `SELECT * FROM questions WHERE subject = 'biology'` | RLS chỉ trả về câu hỏi môn Hóa hoặc kết quả rỗng |
| **TC-SECU-RLS-02** | Tấn công xem trộm bài thi bạn khác qua RPC `fn_get_attempt_review` | **RLS: Private Review** | **P0** | Học sinh A truyền `attempt_id` của Học sinh B vào `fn_get_attempt_review` | RPC Raise Exception "Bạn không có quyền xem lại bài thi này!", mã lỗi 403 |
| **TC-SECU-DATA-01** | Tấn công đánh cắp mật khẩu băm qua View `profiles` hoặc bảng `users` | **Data: Password Leak** | **P1** | Gửi request `GET /rest/v1/profiles?select=*` từ tài khoản bất kỳ | View `profiles` hoàn toàn không có cột `hash_password`, bảng `users` bị khóa RLS |

---

### CHI TIẾT CÁC TEST CASES

#### TC-SECU-H1-01: Tấn công chèn bài thi có sẵn điểm 10 qua REST API (`POST /rest/v1/exam_attempts`)
* **Mục tiêu:** Kiểm chứng việc khóa 100% quyền `INSERT` trực tiếp của học sinh trên bảng `exam_attempts` để triệt tiêu lỗ hổng H1.
* **Độ ưu tiên:** P0 (Critical Security)
* **Kịch bản tấn công:** Kẻ tấn công (học sinh có tài khoản hợp lệ) dùng Postman gửi request tạo lượt thi mới đã có sẵn điểm 10:
  ```bash
  curl -X POST "http://localhost:8000/rest/v1/exam_attempts" \
    -H "Authorization: Bearer <STUDENT_JWT_TOKEN>" \
    -H "apikey: <SUPABASE_ANON_KEY>" \
    -H "Content-Type: application/json" \
    -d '{
      "user_id": "<STUDENT_UUID>",
      "exam_config_id": "<CONFIG_UUID>",
      "score": 10.0,
      "is_passed": true,
      "status": "completed",
      "total_questions": 20,
      "correct_answers_count": 20
    }'
  ```
* **Kết quả mong đợi:**
  - PostgreSQL trả về mã trạng thái HTTP 403 Forbidden.
  - Chi tiết lỗi PostgreSQL: `code: "42501"`, `message: "new row violates row-level security policy for table \"exam_attempts\""`.
  - Không có bất kỳ dòng nào được chèn vào bảng `exam_attempts`. Khẳng định tấn công thất bại.

---

#### TC-SECU-H1-02: Tấn công sửa điểm bài thi đang làm dở qua REST API (`PATCH /rest/v1/exam_attempts`)
* **Mục tiêu:** Kiểm chứng việc khóa 100% quyền `UPDATE` trực tiếp của học sinh trên bảng `exam_attempts`.
* **Độ ưu tiên:** P0 (Critical Security)
* **Kịch bản tấn công:** Học sinh đang làm bài thi (ID: `ATTEMPT_01`, `status = 'in_progress'`), mở DevTools gửi lệnh:
  ```javascript
  const { data, error } = await supabase
    .from('exam_attempts')
    .update({ 
      score: 10.0, 
      is_passed: true, 
      status: 'completed',
      correct_answers_count: 30
    })
    .eq('id', 'ATTEMPT_01');
  ```
* **Kết quả mong đợi:**
  - Lệnh UPDATE bị PostgreSQL chặn hoàn toàn bởi RLS policy `exam_attempts_update_admin` (chỉ cho phép `is_admin()`).
  - Error trả về: `42501 (RLS violation)`.
  - Dữ liệu `score` trong CSDL không bị thay đổi. Điểm số chỉ có thể được sinh ra từ hàm chấm điểm `fn_submit_exam_attempt`.

---

#### TC-SECU-H2-01: Tấn công giảm số câu hỏi xuống 1 để hack điểm tuyệt đối khi nộp bài
* **Mục tiêu:** Kiểm chứng triệt tiêu lỗ hổng H2: Học sinh không thể can thiệp cột `total_questions` hay `pass_score` để gian lận công thức chia điểm.
* **Độ ưu tiên:** P0 (Critical Security)
* **Kịch bản tấn công:** Học sinh gửi lệnh sửa số câu hỏi của bài thi thành 1 câu:
  ```javascript
  const { data, error } = await supabase
    .from('exam_attempts')
    .update({ total_questions: 1, pass_score: 0.0 })
    .eq('id', 'ATTEMPT_01');
  ```
* **Kết quả mong đợi:**
  - Lệnh bị RLS chặn đứng với lỗi 42501.
  - Khi nộp bài qua `fn_submit_exam_attempt`, số câu vẫn được đọc nguyên vẹn từ Snapshot khởi tạo ban đầu (ví dụ: 30 câu), đảm bảo công thức chia điểm chuẩn xác: `(correct_count / 30) * 10`.

---

#### TC-SECU-H3-01: Tấn công soi đáp án đúng bằng DevTools Network hoặc REST query `question_options`
* **Mục tiêu:** Kiểm chứng triệt tiêu lỗ hổng H3: Học sinh không thể đọc được cột `is_correct` từ bảng `question_options` bằng F12 khi đang làm bài thi.
* **Độ ưu tiên:** P0 (Critical Anti-Cheat)
* **Kịch bản tấn công:** Khi đang trong phòng thi, học sinh mở Console chạy lệnh:
  ```javascript
  const { data, error } = await supabase
    .from('question_options')
    .select('id, question_id, option_text, is_correct');
  console.log(data);
  ```
* **Kết quả mong đợi:**
  - RLS policy trên `question_options` chỉ cho phép học sinh đọc các trường công khai. Cột `is_correct` bị ẩn hoàn toàn (trả về `null` hoặc request bị từ chối).
  - Học sinh không thể biết trước phương án nào có `is_correct = true`.

---

#### TC-SECU-H3-02: Kiểm chứng payload của RPC lấy đề thi `fn_get_exam_questions`
* **Mục tiêu:** Xác minh hàm RPC nạp đề cho học sinh được lập trình an toàn, không rò rỉ bất kỳ thông tin đáp án nào.
* **Độ ưu tiên:** P0 (Critical Security)
* **Các bước thực hiện:**
  1. Gọi RPC: `await supabase.rpc('fn_get_exam_questions', { p_attempt_id: attemptId });`
  2. Bắt toàn bộ response JSON và phân tích từng key trong object.
* **Kết quả mong đợi:**
  - Cấu trúc trả về:
    ```json
    {
      "attempt_id": "...",
      "questions": [
        {
          "id": "...",
          "content": "...",
          "question_type": "single_choice",
          "options": [
            { "id": "opt-1", "option_text": "Phương án A" },
            { "id": "opt-2", "option_text": "Phương án B" }
          ]
        }
      ]
    }
    ```
  - Hoàn toàn KHÔNG CÓ trường `is_correct`, `is_true`, `correct_answer` hay `explanation`.

---

#### TC-SECU-H4-01: Tấn công lưu đáp án sau khi hết thời gian thi trên máy chủ qua `fn_save_answer`
* **Mục tiêu:** Kiểm chứng triệt tiêu lỗ hổng H4: Cơ chế Server-side timer trong `fn_save_answer` từ chối lưu bài và khóa bài thi ngay khi quá giờ.
* **Độ ưu tiên:** P0 (Critical Security)
* **Kịch bản tấn công:**
  - Bài thi 15 phút, bắt đầu lúc `10:00:00`.
  - Lúc `10:17:00` (đã quá 15 phút + 60s buffer), học sinh gửi request lưu đáp án:
    ```javascript
    await supabase.rpc('fn_save_answer', {
      p_attempt_id: attemptId,
      p_question_id: questionId,
      p_selected_option_ids: [optionId]
    });
    ```
* **Kết quả mong đợi:**
  - RPC ném ra Exception trên PostgreSQL: `Thời gian làm bài đã kết thúc! Bài thi đã tự động khóa.`
  - Bài thi tự động chuyển sang `status = 'timed_out'`, `auto_submitted = true`.
  - Đáp án gửi lên không được ghi nhận vào `exam_attempt_answers`.

---

#### TC-SECU-H4-02: Tấn công ghi đè trực tiếp câu trả lời vào bảng `exam_attempt_answers`
* **Mục tiêu:** Xác minh học sinh bị khóa hoàn toàn quyền direct INSERT/UPDATE trên bảng `exam_attempt_answers` (buộc phải đi qua RPC `fn_save_answer` có kiểm tra timer).
* **Độ ưu tiên:** P0 (Critical Security)
* **Kịch bản tấn công:** Học sinh dùng REST client gửi:
  ```bash
  curl -X PATCH "http://localhost:8000/rest/v1/exam_attempt_answers?attempt_id=eq.ATTEMPT_01" \
    -H "Authorization: Bearer <STUDENT_JWT_TOKEN>" \
    -d '{ "selected_option_ids": ["uuid-opt-a"] }'
  ```
* **Kết quả mong đợi:**
  - PostgreSQL RLS policy `attempt_answers_update_admin` chặn đứng với mã lỗi 42501 (chỉ cho phép `is_admin()`).
  - Học sinh không thể bypass cơ chế kiểm tra thời gian của hàm `fn_save_answer`.

---

#### TC-SECU-RLS-01: Tấn công truy xuất chéo môn học: Giáo viên môn Hóa query dữ liệu môn Sinh
* **Mục tiêu:** Xác minh cách ly dữ liệu giữa các giáo viên bộ môn theo đúng phân công trong `teacher_classes`.
* **Độ ưu tiên:** P0 (Security Scope)
* **Kịch bản tấn công:** Giáo viên Hóa học (`USER_TEACHER_CHEM`) gửi query lấy danh sách câu hỏi môn Sinh học:
  ```javascript
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('subject', 'biology');
  ```
* **Kết quả mong đợi:**
  - RLS policy `questions_select` kiểm tra: `(is_teacher() AND subject IN (SELECT tc.subject FROM teacher_classes tc WHERE tc.teacher_id = auth.uid()))`.
  - Do giáo viên này chỉ dạy môn Hóa, câu query trả về danh sách rỗng (`[]`).
  - Giáo viên không thể đọc hoặc can thiệp đề thi của bộ môn khác.

---

#### TC-SECU-RLS-02: Tấn công xem trộm bài thi bạn khác qua RPC `fn_get_attempt_review`
* **Mục tiêu:** Xác minh triệt tiêu Warning 1: Hàm `SECURITY DEFINER` `fn_get_attempt_review` kiểm tra nghiêm ngặt quyền sở hữu `user_id = auth.uid()`.
* **Độ ưu tiên:** P0 (Privacy Protection)
* **Kịch bản tấn công:** Học sinh A đăng nhập, lấy được UUID bài thi của Học sinh B (`ATTEMPT_OF_STUDENT_B`), gửi lệnh:
  ```javascript
  await supabase.rpc('fn_get_attempt_review', { 
    p_attempt_id: 'ATTEMPT_OF_STUDENT_B' 
  });
  ```
* **Kết quả mong đợi:**
  - Hàm kiểm tra: `IF v_attempt.user_id <> auth.uid() AND NOT is_admin() AND NOT (is_teacher()...) THEN RAISE EXCEPTION...`
  - Bị từ chối ngay lập tức với lỗi: `Bảo mật: Bạn không có quyền xem lại bài thi này!`.
  - Hoàn toàn không trả về điểm số hay bài làm của Học sinh B.

---

#### TC-SECU-DATA-01: Tấn công đánh cắp mật khẩu băm qua View `profiles` hoặc bảng `users`
* **Mục tiêu:** Xác minh triệt tiêu lỗ hổng "Lộ dữ liệu người dùng qua view profiles": Client không thể đọc được mật khẩu băm của bất kỳ ai.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Học sinh đăng nhập, gửi request:
     ```javascript
     const res1 = await supabase.from('profiles').select('*');
     const res2 = await supabase.from('users').select('hash_password');
     ```
* **Kết quả mong đợi:**
  - `profiles`: View không định nghĩa cột `hash_password`, kết quả trả về chỉ gồm thông tin công khai (`id`, `username`, `email`, `full_name`, `avatar_url`, `role`, `class_id`).
  - `users`: RLS policy chỉ cho phép học sinh đọc bản ghi của chính mình (`id = auth.uid()`), và không cho phép đọc cột băm hoặc client bị từ chối truy xuất trực tiếp bảng `users`.
