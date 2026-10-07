# TEST SUITE 06: QUẢN LÝ LỚP HỌC, IMPORT HỌC SINH & PHÂN CÔNG GIÁO VIÊN (FLOW 06)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Flow 06 (`exam-app/flows/06-quan-ly-lop-hoc-phan-lop.md`), Lược đồ CSDL v2.4 bảng `classes`, `users`, `teacher_classes`, Trigger `trg_fn_prevent_class_change_by_student`.  
> **Mục tiêu:** Kiểm thử quy trình quản lý tổ chức lớp học: Tạo lớp, phân công giáo viên theo môn học, import danh sách học sinh từ file Excel, xử lý trùng email, chuyển lớp bảo lưu lịch sử thi, và ngăn chặn học sinh tự ý đổi lớp học.  
> **Tổng số Test Cases:** 8 (3 P0, 4 P1, 1 P2)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Loại Kiểm Thử | Độ Ưu Tiên | Kết Quả Mong Đợi Tóm Tắt |
| :--- | :--- | :--- | :---: | :--- |
| **TC-CLAS-01** | Tạo lớp học mới với mã lớp duy nhất (Unique Code) | Functional / Admin | **P0** | Lớp học tạo thành công trong `classes`, không cho trùng mã lớp |
| **TC-CLAS-02** | Phân công Giáo viên bộ môn phụ trách lớp theo môn học | Functional / Admin | **P1** | Ghi nhận chính xác vào `teacher_classes` (Thầy A - Hóa, Cô B - Sinh) |
| **TC-CLAS-03** | Tải file mẫu Excel và Import danh sách học sinh vào lớp | Integration / Import | **P0** | Nạp thành công danh sách học sinh, tự gán role `student` và `class_id` |
| **TC-CLAS-04** | Import học sinh có email đã tồn tại trong hệ thống | Validation / Business Logic | **P1** | Cập nhật `class_id` cho tài khoản sẵn có, không tạo trùng tài khoản |
| **TC-CLAS-05** | Import file Excel có định dạng email sai hoặc thiếu trường bắt buộc | Negative / Validation | **P1** | Báo đỏ danh sách dòng bị lỗi, từ chối nạp dòng sai |
| **TC-CLAS-06** | Thực hiện Chuyển lớp cho học sinh (Class Transfer) | Functional / Admin | **P1** | Cập nhật `class_id` mới thành công cho học sinh |
| **TC-CLAS-07** | Bảo toàn 100% lịch sử bài thi và điểm số khi học sinh chuyển lớp | Data Integrity | **P0** | Toàn bộ bài thi cũ được giữ nguyên vẹn điểm số và thời gian làm bài |
| **TC-CLAS-08** | Chống học sinh tự ý nhảy lớp: Thử gửi lệnh đổi `class_id` cá nhân | Security / Anti-Tamper | **P0** | Trigger chặn đứng, ném exception "Học sinh không có quyền tự đổi lớp" |

---

### CHI TIẾT CÁC TEST CASES

#### TC-CLAS-01: Tạo lớp học mới với mã lớp duy nhất (Unique Code)
* **Mục tiêu:** Xác minh Admin tạo lớp học thành công và ràng buộc duy nhất trên mã lớp (`classes.code`).
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:** Đăng nhập tài khoản Admin.
* **Các bước thực hiện:**
  1. Vào mục "Quản lý Lớp học" (`/admin/classes`).
  2. Bấm "Tạo Lớp mới".
  3. Nhập Mã lớp: `10A1`, Tên lớp: `Lớp 10A1 Chuyên Tự Nhiên`, Khối: `10`, Niên khóa: `2026-2027` -> Bấm Lưu.
  4. Thử tạo tiếp một lớp khác cũng có Mã lớp là `10A1`.
* **Kết quả mong đợi:**
  - Bước 3: Tạo thành công lớp 10A1, hiển thị trên danh sách.
  - Bước 4: Hệ thống báo lỗi trùng lặp: "Mã lớp 10A1 đã tồn tại trong niên khóa này!". Ràng buộc `UNIQUE(code)` hoạt động chuẩn xác.

---

#### TC-CLAS-02: Phân công Giáo viên bộ môn phụ trách lớp theo môn học
* **Mục tiêu:** Xác minh Admin gán đúng giáo viên bộ môn phụ trách từng môn học cho lớp.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Có Giáo viên Hóa học (`USER_TEACHER_CHEM`) và Giáo viên Sinh học (`USER_TEACHER_BIO`). Lớp 10A1 đã tồn tại.
* **Các bước thực hiện:**
  1. Chọn Lớp 10A1 -> Bấm "Phân công Giáo viên".
  2. Gán Thầy Nguyễn Văn A phụ trách môn Hóa học (`chemistry`).
  3. Gán Cô Trần Thị B phụ trách môn Sinh học (`biology`).
  4. Bấm "Lưu phân công".
* **Kết quả mong đợi:**
  - CSDL `teacher_classes`: Tạo 2 bản ghi liên kết tương ứng.
  - Giao diện lớp 10A1 hiển thị đầy đủ tên giáo viên phụ trách từng bộ môn.

---

#### TC-CLAS-03: Tải file mẫu Excel và Import danh sách học sinh vào lớp
* **Mục tiêu:** Xác minh tính năng nạp tự động danh sách học sinh từ file Excel chuẩn.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:** Lớp 10A1 chưa có học sinh. File `Danh_Sach_Hoc_Sinh_10A1.xlsx` chuẩn bị sẵn 35 dòng dữ liệu hợp lệ (Mã HS, Họ tên, Email, Số điện thoại).
* **Các bước thực hiện:**
  1. Chọn lớp 10A1 -> Bấm "Import Học Sinh từ Excel".
  2. Tải lên file `Danh_Sach_Hoc_Sinh_10A1.xlsx`.
  3. Bấm "Quét và Nạp dữ liệu".
* **Kết quả mong đợi:**
  - Hệ thống báo: "Nạp thành công 35/35 học sinh vào Lớp 10A1".
  - Bảng `users`: Tạo 35 tài khoản với vai trò mặc định `role = 'student'` và `class_id` trỏ đúng vào Lớp 10A1.

---

#### TC-CLAS-04: Import học sinh có email đã tồn tại trong hệ thống
* **Mục tiêu:** Xác minh cơ chế xử lý thông minh: Khi học sinh đã có tài khoản từ năm học trước, import vào lớp mới sẽ cập nhật `class_id` thay vì báo lỗi trùng hoặc tạo tài khoản nhân bản.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Học sinh Lê Văn C (`levanc@exam.local`) đã có tài khoản trong hệ thống, đang thuộc lớp cũ 9A1.
* **Các bước thực hiện:**
  1. File Excel lớp 10A1 chứa dòng học sinh Lê Văn C (`levanc@exam.local`).
  2. Tải file lên và thực hiện import vào lớp 10A1.
* **Kết quả mong đợi:**
  - Hệ thống phát hiện email đã tồn tại.
  - Tự động cập nhật `class_id = uuid_lop_10a1` cho tài khoản của Lê Văn C.
  - Tổng số tài khoản trong bảng `users` không bị tăng trùng bản ghi.

---

#### TC-CLAS-05: Import file Excel có định dạng email sai hoặc thiếu trường bắt buộc
* **Mục tiêu:** Đảm bảo hệ thống phát hiện và báo lỗi chi tiết đối với dữ liệu không hợp lệ.
* **Độ ưu tiên:** P1 (Validation)
* **Tiền điều kiện:** File Excel có dòng 5 sai cú pháp email (`nguyenvana@@gmail`), dòng 8 bỏ trống Họ tên.
* **Các bước thực hiện:**
  1. Tải file lỗi lên hệ thống.
  2. Bấm "Quét dữ liệu".
* **Kết quả mong đợi:**
  - Bảng xem trước hiển thị viền đỏ cảnh báo:
    - "Dòng 5: Định dạng email không hợp lệ".
    - "Dòng 8: Họ và tên không được để trống".
  - Cho phép Admin chỉnh sửa trực tiếp trên bảng preview hoặc tải file đã sửa lên lại.

---

#### TC-CLAS-06: Thực hiện Chuyển lớp cho học sinh (Class Transfer)
* **Mục tiêu:** Xác minh chức năng chuyển học sinh sang lớp mới khi có sự điều chuyển tổ chức.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Học sinh Trần Thị D đang học lớp 10A1.
* **Các bước thực hiện:**
  1. Admin mở danh sách học sinh lớp 10A1.
  2. Chọn học sinh Trần Thị D -> Bấm "Chuyển Lớp".
  3. Chọn lớp đích: `Lớp 10A2`.
  4. Hộp thoại xác nhận hiển thị -> Bấm "Xác nhận chuyển lớp".
* **Kết quả mong đợi:**
  - Học sinh Trần Thị D biến mất khỏi danh sách lớp 10A1 và xuất hiện ngay trong danh sách lớp 10A2.
  - CSDL `users`: Cột `class_id` được cập nhật sang ID của lớp 10A2.

---

#### TC-CLAS-07: Bảo toàn 100% lịch sử bài thi và điểm số khi học sinh chuyển lớp
* **Mục tiêu:** Xác minh tính toàn vẹn dữ liệu: Việc chuyển lớp không làm mất, không làm sai lệch và không xóa các bài thi đã làm ở lớp cũ.
* **Độ ưu tiên:** P0 (Critical Data Integrity)
* **Tiền điều kiện:** Học sinh Trần Thị D (ở bước TC-CLAS-06) đã từng làm 3 bài thi môn Hóa khi còn ở lớp 10A1 (Điểm: 7.0, 8.5, 9.0).
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản của học sinh Trần Thị D -> Vào mục "Lịch sử làm bài".
  2. Đăng nhập tài khoản Giáo viên Hóa lớp 10A2 -> Mở hồ sơ học tập của học sinh D.
* **Kết quả mong đợi:**
  - 3 bài thi cũ vẫn hiển thị đầy đủ, nguyên vẹn điểm số và thời gian làm bài trong lịch sử cá nhân của học sinh D.
  - Giáo viên lớp mới có thể tra cứu được kết quả quá trình học tập trước đây của học sinh.

---

#### TC-CLAS-08: Chống học sinh tự ý nhảy lớp: Gửi lệnh đổi `class_id` cá nhân
* **Mục tiêu:** Khắc phục triệt để Warning 5: Chặn đứng nguy cơ học sinh am hiểu kỹ thuật tự gửi lệnh sửa `class_id` của chính mình để nhảy sang lớp khác.
* **Độ ưu tiên:** P0 (Critical Security)
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Học sinh (`USER_STUDENT_01`).
  2. Mở DevTools Console, gửi lệnh:
     ```javascript
     const { data, error } = await supabase
       .from('users')
       .update({ class_id: 'UUID_LOP_CHUYEN_10A2' })
       .eq('id', user.id);
     ```
* **Kết quả mong đợi:**
  - Trigger `trg_fn_prevent_class_change_by_student` trên PostgreSQL kích hoạt.
  - Lệnh bị hủy và ném ra Exception: `Bảo mật: Học sinh không có quyền tự thay đổi lớp học! Việc phân lớp do Ban quản trị quyết định.`
  - Cột `class_id` của học sinh không bị thay đổi.
