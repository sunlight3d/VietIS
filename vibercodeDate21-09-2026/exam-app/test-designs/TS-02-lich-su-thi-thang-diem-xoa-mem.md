# TEST SUITE 02: LỊCH SỬ THI, THANG ĐIỂM 10 & XÓA MỀM BÀI THI (FLOW 02)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Flow 02 (`exam-app/flows/02-xem-lich-su-xoa-mem.md`), Lược đồ CSDL v2.4 bảng `exam_attempts`, RPC `fn_get_attempt_review`, RPC `fn_delete_student_attempt`.  
> **Mục tiêu:** Kiểm thử hiển thị lịch sử bài thi theo cá nhân, quy chuẩn xếp loại thang điểm 10 và nhận diện mã màu Xanh/Đỏ, bảo mật xem lại bài làm qua `fn_get_attempt_review`, và cơ chế xóa mềm an toàn qua RPC `fn_delete_student_attempt` (bảo toàn báo cáo giáo viên).  
> **Tổng số Test Cases:** 7 (3 P0, 3 P1, 1 P2)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Loại Kiểm Thử | Độ Ưu Tiên | Kết Quả Mong Đợi Tóm Tắt |
| :--- | :--- | :--- | :---: | :--- |
| **TC-HIST-01** | Hiển thị danh sách lịch sử bài thi của chính học sinh | Functional | **P0** | Chỉ hiển thị bài thi của tài khoản đang đăng nhập, xếp theo thời gian mới nhất |
| **TC-HIST-02** | Quy chuẩn Thang điểm 10 và Mã màu Đạt/Chưa đạt | UI / Business Logic | **P1** | >= 5.0đ hiển thị màu Xanh (ĐẠT), < 5.0đ hiển thị màu ĐỎ (CHƯA ĐẠT); đúng 5 mức xếp loại |
| **TC-HIST-03** | Xem chi tiết bài làm, đáp án đúng và giải thích qua `fn_get_attempt_review` | Functional / RPC | **P0** | Hiển thị chính xác từng câu đúng/sai, phương án đã chọn, đáp án chuẩn và lời giải |
| **TC-HIST-04** | Bảo mật riêng tư: Học sinh cố tình xem bài thi của bạn khác qua RPC `fn_get_attempt_review` | Security / Access Control | **P0** | Báo lỗi từ chối quyền truy cập (Raise Exception "Bảo mật: Không có quyền xem bài thi...") |
| **TC-HIST-05** | Thực hiện xóa mềm bài thi cá nhân qua RPC `fn_delete_student_attempt` | Functional / RPC | **P1** | Bài thi biến mất khỏi giao diện học sinh (`is_student_deleted = true`) |
| **TC-HIST-06** | Bảo toàn dữ liệu giáo viên và admin khi học sinh xóa mềm bài thi | Data Integrity | **P1** | Điểm số và lượt thi vẫn hiển thị trọn vẹn trong bảng điểm lớp và báo cáo giáo viên/admin |
| **TC-HIST-07** | Thử nghiệm gọi lệnh `UPDATE` trực tiếp bảng `exam_attempts` để xóa bài | Security / Anti-Tamper | **P1** | Bị chặn 100% bởi RLS (HTTP 403 Forbidden / PostgreSQL Error 42501) |

---

### CHI TIẾT CÁC TEST CASES

#### TC-HIST-01: Hiển thị danh sách lịch sử bài thi của chính học sinh
* **Mục tiêu:** Xác minh tính cách ly dữ liệu cá nhân: Học sinh chỉ xem được bài thi do chính mình làm, không bị lộ bài thi của học sinh khác.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:**
  - Học sinh A (`USER_STUDENT_01`) có 3 bài thi (1 bài Hóa 8.5đ, 1 bài Sinh 4.0đ, 1 bài Anh 9.0đ).
  - Học sinh B (`USER_STUDENT_02`) có 2 bài thi.
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Học sinh A (`hocsinh1@exam.local`).
  2. Truy cập tab **"Lịch sử làm bài"** (`/student/history`).
  3. Kiểm tra số lượng bài thi và thông tin hiển thị.
* **Kết quả mong đợi:**
  - Danh sách chỉ hiển thị đúng 3 bài thi của Học sinh A. Tuyệt đối không xuất hiện bài thi của Học sinh B.
  - Các bài thi sắp xếp theo thứ tự thời gian giảm dần (`started_at DESC`).
  - Mỗi thẻ bài thi hiển thị: Tên môn học, Ngày giờ thi, Điểm số, Thời gian làm bài, Trạng thái Đạt/Hỏng.

---

#### TC-HIST-02: Quy chuẩn Thang điểm 10 và Mã màu Đạt/Chưa đạt
* **Mục tiêu:** Kiểm tra độ chính xác của logic xếp loại học lực theo thang điểm 10 và màu sắc giao diện trực quan.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Học sinh có các bài thi với các mốc điểm biên: 9.5đ, 8.5đ, 7.0đ, 5.0đ, 4.5đ, 0.0đ.
* **Các bước thực hiện:**
  1. Mở danh sách lịch sử bài thi.
  2. Quan sát huy hiệu xếp loại và màu sắc viền thẻ tương ứng với từng mức điểm.
* **Dữ liệu kiểm thử & Kết quả mong đợi:**
  | Điểm số | Phân loại học lực | Trạng thái Đạt/Không đạt | Màu sắc hiển thị |
  | :--- | :--- | :--- | :--- |
  | **9.5đ** | XUẤT SẮC | ĐẠT (Passed) | Viền thẻ Xanh lá đậm, Huy hiệu Xanh ngọc |
  | **8.5đ** | GIỎI | ĐẠT (Passed) | Viền thẻ Xanh lá, Huy hiệu Xanh lá |
  | **7.0đ** | KHÁ | ĐẠT (Passed) | Viền thẻ Xanh dương, Huy hiệu Xanh dương |
  | **5.0đ** (Biên Đạt) | TRUNG BÌNH | ĐẠT (Passed) | Viền thẻ Vàng cam, Huy hiệu Vàng cam |
  | **4.5đ** (Biên Trượt) | YẾU / CHƯA ĐẠT | CHƯA ĐẠT (Failed) | Viền thẻ ĐỎ RỰC, Icon Cảnh báo tam giác đỏ |
  | **0.0đ** | YẾU / CHƯA ĐẠT | CHƯA ĐẠT (Failed) | Viền thẻ ĐỎ RỰC, Huy hiệu Đỏ cảnh báo |

---

#### TC-HIST-03: Xem chi tiết bài làm, đáp án đúng và giải thích qua `fn_get_attempt_review`
* **Mục tiêu:** Xác minh học sinh xem lại bài thi của mình đầy đủ câu đúng/sai và lời giải thích thông qua RPC bảo mật.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:** Lượt thi `ATTEMPT_01` (thuộc về Học sinh A) đã hoàn thành (`status = 'completed'`).
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Học sinh A.
  2. Bấm vào bài thi `ATTEMPT_01` để xem chi tiết.
  3. Frontend gọi RPC: `supabase.rpc('fn_get_attempt_review', { p_attempt_id: 'ATTEMPT_01' })`.
* **Kết quả mong đợi:**
  - RPC trả về JSON thành công (`success: true`) gồm: `score`, `total_questions`, `correct_count`, và mảng `questions`.
  - Với mỗi câu hỏi: Trả về đầy đủ nội dung, công thức LaTeX, phương án học sinh đã chọn (`selected_options`), đáp án đúng hệ thống (`correct_options`), cờ `is_correct` từng câu và lời giải sư phạm `explanation`.
  - Giao diện: Câu đúng có icon tích xanh [✓], câu sai có icon [X] đỏ kèm ô giải thích chi tiết mở sẵn bên dưới.

---

#### TC-HIST-04: Bảo mật riêng tư: Học sinh cố tình xem bài thi của bạn khác
* **Mục tiêu:** Xác minh triệt tiêu Warning 1: Chặn đứng lỗ hổng xem trộm bài thi bạn khác khi gọi hàm `fn_get_attempt_review`.
* **Độ ưu tiên:** P0 (Critical Security)
* **Tiền điều kiện:**
  - Học sinh A đăng nhập với token của `USER_STUDENT_01`.
  - Học sinh B (`USER_STUDENT_02`) có lượt thi `ATTEMPT_OF_STUDENT_B`.
* **Các bước thực hiện:**
  1. Học sinh A mở DevTools Console hoặc gửi request qua API:
     ```javascript
     const { data, error } = await supabase.rpc('fn_get_attempt_review', { 
       p_attempt_id: 'ATTEMPT_OF_STUDENT_B' 
     });
     ```
* **Kết quả mong đợi:**
  - RPC ném ra Exception lỗi bảo mật: `Bảo mật: Bạn không có quyền xem lại bài thi này!`
  - API trả về mã lỗi 400 hoặc 403, hoàn toàn không trả về bất kỳ dữ liệu câu hỏi, đáp án hay điểm số nào của Học sinh B.

---

#### TC-HIST-05: Thực hiện xóa mềm bài thi cá nhân qua RPC `fn_delete_student_attempt`
* **Mục tiêu:** Xác minh học sinh ẩn được bài thi khỏi danh sách cá nhân thông qua RPC chuyên dụng mà không cần cấp quyền UPDATE trực tiếp bảng.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Học sinh A có bài thi `ATTEMPT_01` đang hiển thị trong lịch sử.
* **Các bước thực hiện:**
  1. Bấm nút biểu tượng thùng rác tại bài thi `ATTEMPT_01`.
  2. Modal xác nhận hiển thị: "Bạn có chắc chắn muốn xóa bài thi này khỏi lịch sử cá nhân?".
  3. Bấm **"Đồng ý xóa"**.
  4. Frontend gọi RPC: `supabase.rpc('fn_delete_student_attempt', { p_attempt_id: 'ATTEMPT_01' })`.
* **Kết quả mong đợi:**
  - RPC trả về: `{ success: true, attempt_id: 'ATTEMPT_01', is_student_deleted: true }`.
  - Giao diện: Bài thi biến mất ngay lập tức khỏi danh sách lịch sử cá nhân của Học sinh A.
  - Hiển thị Toast thông báo: "Đã ẩn bài thi khỏi lịch sử cá nhân thành công".
  - Kiểm tra CSDL: Bản ghi `exam_attempts` vẫn tồn tại, chỉ có cột `is_student_deleted = true`.

---

#### TC-HIST-06: Bảo toàn dữ liệu giáo viên và admin khi học sinh xóa mềm bài thi
* **Mục tiêu:** Xác minh tính toàn vẹn báo cáo: Việc học sinh xóa bài điểm thấp không làm mất bài thi khỏi bảng điểm của lớp hay làm sai lệch thống kê giảng dạy.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Học sinh A vừa xóa mềm bài thi `ATTEMPT_01` (điểm 4.0đ) ở bước TC-HIST-05.
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Giáo viên phụ trách môn (`USER_TEACHER_CHEM`).
  2. Truy cập phân hệ xem bảng điểm lớp (`/teacher/classes/10A1`).
  3. Đăng nhập tài khoản Quản trị viên (`USER_ADMIN`) và mở Báo cáo thống kê toàn trường.
* **Kết quả mong đợi:**
  - Trên màn hình Giáo viên: Bài thi 4.0đ của Học sinh A vẫn xuất hiện đầy đủ trong bảng điểm, số lần làm bài và phổ điểm của lớp không bị sụt giảm.
  - Trên màn hình Admin: Thống kê tỷ lệ trượt của kỳ thi vẫn tính đầy đủ bài thi này.

---

#### TC-HIST-07: Thử nghiệm gọi lệnh `UPDATE` trực tiếp bảng `exam_attempts`
* **Mục tiêu:** Xác minh học sinh bị khóa hoàn toàn quyền direct UPDATE trên bảng vật lý `exam_attempts`.
* **Độ ưu tiên:** P1 (Security)
* **Các bước thực hiện:**
  1. Học sinh đăng nhập và mở DevTools Console.
  2. Gửi lệnh sửa trực tiếp qua Supabase Client REST:
     ```javascript
     const { data, error } = await supabase
       .from('exam_attempts')
       .update({ is_student_deleted: true })
       .eq('id', 'ATTEMPT_01');
     ```
* **Kết quả mong đợi:**
  - Lệnh bị chặn ngay tại tầng PostgreSQL RLS.
  - Error trả về chứa mã lỗi `42501` (new row violates row-level security policy for table "exam_attempts") hoặc HTTP 403 Forbidden.
  - Khẳng định: Mọi hành vi cập nhật bài thi bắt buộc phải đi qua RPC `fn_delete_student_attempt`.
