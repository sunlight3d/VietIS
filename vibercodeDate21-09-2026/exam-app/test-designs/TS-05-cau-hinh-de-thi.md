# TEST SUITE 05: ADMIN CẤU HÌNH ĐỀ THI THEO KỲ THI & MÔN HỌC (FLOW 05)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Flow 05 (`exam-app/flows/05-cau-hinh-de-thi.md`), Lược đồ CSDL v2.4 bảng `exam_configs`, `questions`, RLS `exam_configs_manage_admin`.  
> **Mục tiêu:** Kiểm thử chức năng Admin thiết lập cấu hình kỳ thi chi tiết (15 phút, 1 tiết, Giữa kỳ, Cuối kỳ) theo từng môn học, kiểm tra tính sẵn sàng của ngân hàng câu hỏi, cơ chế Snapshot tham số đề thi bất biến, giới hạn khung giờ mở thi (`start_time`/`end_time`), và phân quyền chỉ Admin mới có quyền cấu hình.  
> **Tổng số Test Cases:** 6 (2 P0, 3 P1, 1 P2)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Loại Kiểm Thử | Độ Ưu Tiên | Kết Quả Mong Đợi Tóm Tắt |
| :--- | :--- | :--- | :---: | :--- |
| **TC-CONF-01** | Tạo cấu hình kỳ thi mới với đầy đủ tham số hợp lệ | Functional / Admin | **P0** | Bản ghi tạo thành công trong `exam_configs`, kích hoạt sẵn sàng |
| **TC-CONF-02** | Kiểm tra tính sẵn sàng của kho đề: Số câu yêu cầu > Số câu `approved` | Validation / Logic | **P1** | Hệ thống cảnh báo đỏ: Ngân hàng câu hỏi không đủ số câu yêu cầu |
| **TC-CONF-03** | Bảo toàn tham số qua cơ chế Snapshot khi Admin sửa cấu hình | Data Integrity | **P0** | Bài thi cũ giữ nguyên cấu hình lúc thi, không bị ảnh hưởng bởi thay đổi mới |
| **TC-CONF-04** | Kiểm tra khung giờ thi: Thí sinh vào thi trước `start_time` hoặc sau `end_time` | Access Control / Window | **P1** | Chặn vào thi, hiển thị thông báo chưa đến giờ hoặc kỳ thi đã kết thúc |
| **TC-CONF-05** | Tùy biến ngưỡng điểm đạt (`pass_score`) theo từng kỳ thi | Business Logic | **P1** | Admin đổi `pass_score = 6.0` hoặc `7.0`, hệ thống đánh giá `is_passed` chính xác |
| **TC-CONF-06** | Phân quyền bảo mật: Học sinh hoặc Giáo viên cố tình sửa cấu hình đề | Security / RLS | **P1** | Bị chặn 100% bởi RLS (HTTP 403 Forbidden / Error 42501) |

---

### CHI TIẾT CÁC TEST CASES

#### TC-CONF-01: Tạo cấu hình kỳ thi mới với đầy đủ tham số hợp lệ
* **Mục tiêu:** Xác minh Admin tạo thành công kỳ thi mới gắn với môn học và khung giờ cụ thể.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:** Đăng nhập tài khoản Admin (`USER_ADMIN`). Kho đề môn Hóa học có 120 câu hỏi `approved`.
* **Các bước thực hiện:**
  1. Vào menu **"Quản lý Kỳ thi & Cấu hình Đề"** (`/admin/exams`).
  2. Bấm nút **"Thêm Kỳ Thi Mới"**.
  3. Nhập Tiêu đề: "Kiểm tra Giữa kỳ 1 - Hóa học 10".
  4. Chọn Môn học: `chemistry`.
  5. Chọn Loại bài thi: `mid_term`.
  6. Học kỳ: `Học kỳ 1`.
  7. Thiết lập Thời gian mở đề: `2026-10-15 08:00:00`, Đóng đề: `2026-10-15 17:00:00`.
  8. Số câu hỏi: `30` câu; Thời lượng: `45` phút; Điểm chuẩn đạt: `5.0`.
  9. Bật cờ: "Xáo trộn câu hỏi" (`shuffle_questions = true`), "Xáo trộn đáp án" (`shuffle_options = true`).
  10. Bấm **"Lưu & Phát hành Kỳ Thi"**.
* **Kết quả mong đợi:**
  - Bản ghi được tạo trong bảng `exam_configs`.
  - Hiển thị Toast thông báo: "Đã lưu cấu hình kỳ thi thành công".
  - Kỳ thi hiển thị ở trạng thái "Đang mở" (Active) trên danh sách.

---

#### TC-CONF-02: Kiểm tra tính sẵn sàng của kho đề: Số câu yêu cầu > Số câu `approved`
* **Mục tiêu:** Ngăn chặn việc phát hành kỳ thi khi ngân hàng câu hỏi môn học không đủ số câu đã duyệt.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Môn Tiếng Anh hiện chỉ có 15 câu hỏi ở trạng thái `status = 'approved'` trong bảng `questions`.
* **Các bước thực hiện:**
  1. Admin tạo kỳ thi Tiếng Anh 1 tiết.
  2. Nhập số lượng câu hỏi: `40` câu.
  3. Bấm "Lưu cấu hình".
* **Kết quả mong đợi:**
  - Hệ thống kiểm tra số lượng câu hỏi khả dụng (`approved` và `is_deleted = false`).
  - Cảnh báo lỗi màu đỏ xuất hiện: "Ngân hàng môn Tiếng Anh hiện chỉ có 15 câu đã duyệt, không đủ 40 câu theo cấu hình đề. Vui lòng bổ sung câu hỏi trước khi phát hành!".
  - Không cho phép lưu cấu hình hoặc không cho kích hoạt `is_active = true`.

---

#### TC-CONF-03: Bảo toàn tham số qua cơ chế Snapshot khi Admin sửa cấu hình
* **Mục tiêu:** Xác minh tính bất biến của bài thi cũ: Khi Admin sửa đổi thời lượng hoặc số câu của kỳ thi, các bài thi đã làm trong quá khứ không bị thay đổi dữ liệu hay lỗi tính điểm.
* **Độ ưu tiên:** P0 (Critical Data Integrity)
* **Tiền điều kiện:** Học sinh A đã thi xong đề "Kiểm tra 15 phút Hóa" với cấu hình ban đầu: `duration_minutes = 15`, `total_questions = 10`, `pass_score = 5.0`, điểm đạt 8.0đ.
* **Các bước thực hiện:**
  1. Admin mở kỳ thi trên và chỉnh sửa:
     - Đổi số câu từ 10 thành 20 câu.
     - Đổi thời lượng từ 15 phút thành 30 phút.
     - Đổi điểm chuẩn đạt từ 5.0 thành 7.0 điểm.
  2. Bấm "Lưu thay đổi".
  3. Vào xem lại bài thi cũ của Học sinh A.
* **Kết quả mong đợi:**
  - Bản ghi `exam_attempts` cũ của Học sinh A vẫn giữ nguyên: `duration_minutes = 15`, `total_questions = 10`, `pass_score = 5.0`, `score = 8.0`, `is_passed = true`.
  - Kết quả và xếp loại của Học sinh A không bị recalculate theo cấu hình mới.

---

#### TC-CONF-04: Kiểm tra khung giờ thi: Vào thi trước hoặc sau thời gian mở đề
* **Mục tiêu:** Xác minh học sinh chỉ có thể làm bài trong khoảng thời gian quy định từ `start_time` đến `end_time`.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Kỳ thi có khung giờ từ `08:00` đến `10:00` ngày `15/10/2026`.
* **Các bước thực hiện:**
  1. Trường hợp 1: Học sinh vào thi lúc `07:30` (Trước giờ mở).
  2. Trường hợp 2: Học sinh vào thi lúc `10:15` (Sau giờ đóng đề).
* **Kết quả mong đợi:**
  - Trường hợp 1: Nút "Bắt đầu làm bài" bị khóa, hiển thị đếm ngược: "Đề thi sẽ mở sau 30 phút". Gọi RPC `fn_start_exam` bị từ chối: "Kỳ thi chưa đến thời gian mở đề!".
  - Trường hợp 2: Hiển thị nhãn "Kỳ thi đã kết thúc". Gọi RPC `fn_start_exam` bị từ chối: "Kỳ thi đã hết thời gian làm bài!".

---

#### TC-CONF-05: Tùy biến ngưỡng điểm đạt (`pass_score`) theo từng kỳ thi
* **Mục tiêu:** Xác minh Admin có toàn quyền thiết lập ngưỡng điểm đạt linh hoạt (thay vì cố định cứng 5.0 điểm), và hệ thống đánh giá `is_passed` chính xác theo từng kỳ thi.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Admin tạo bài Khảo sát Đội tuyển Học sinh Giỏi với `pass_score = 8.0`.
  2. Thí sinh X thi đạt 7.5 điểm -> Nộp bài.
  3. Thí sinh Y thi đạt 8.5 điểm -> Nộp bài.
* **Kết quả mong đợi:**
  - Thí sinh X (7.5đ): Hệ thống đánh giá `is_passed = false` (Chưa đạt), thẻ kết quả hiển thị màu ĐỎ cảnh báo.
  - Thí sinh Y (8.5đ): Hệ thống đánh giá `is_passed = true` (Đạt), thẻ kết quả hiển thị màu XANH LÁ.

---

#### TC-CONF-06: Phân quyền bảo mật: Học sinh hoặc Giáo viên cố tình sửa cấu hình đề
* **Mục tiêu:** Đảm bảo chỉ Admin mới có quyền thao tác trên bảng `exam_configs`.
* **Độ ưu tiên:** P1 (Security / RLS)
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Học sinh hoặc Giáo viên.
  2. Dùng DevTools gửi lệnh SQL hoặc REST API:
     ```javascript
     await supabase.from('exam_configs').update({ pass_score: 1.0 }).eq('id', configId);
     ```
* **Kết quả mong đợi:**
  - PostgreSQL RLS chặn đứng với lỗi 42501 (RLS violation) hoặc HTTP 403 Forbidden.
  - Cấu hình đề thi được bảo vệ toàn vẹn tuyệt đối.
