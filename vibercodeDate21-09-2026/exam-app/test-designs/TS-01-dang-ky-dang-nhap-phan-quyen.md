# TEST SUITE 01: ĐĂNG KÝ, ĐĂNG NHẬP & PHÂN QUYỀN TRUY CẬP (FLOW 01)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Flow 01 (`exam-app/flows/01-dang-ky-dang-nhap.md`), Lược đồ CSDL v2.4 bảng `users`, `classes`, view `profiles`.  
> **Mục tiêu:** Kiểm thử toàn diện luồng xác thực đăng ký tài khoản, đăng nhập email/Google OAuth, mã hóa mật khẩu, chống tự nâng quyền Admin, và điều hướng chính xác theo 3 vai trò (Student, Teacher, Admin).  
> **Tổng số Test Cases:** 8 (4 P0, 3 P1, 1 P2)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Loại Kiểm Thử | Độ Ưu Tiên | Kết Quả Mong Đợi Tóm Tắt |
| :--- | :--- | :--- | :---: | :--- |
| **TC-AUTH-01** | Đăng ký tài khoản học sinh hợp lệ với đầy đủ thông tin và chọn lớp | Functional | **P0** | Tài khoản tạo thành công với role `student`, mật khẩu được băm BCrypt |
| **TC-AUTH-02** | Chống tự nâng quyền: Gửi payload đăng ký kèm `role: 'admin'` hoặc `role: 'teacher'` | Security / Anti-Tamper | **P0** | Hệ thống cưỡng chế gán `role = 'student'`, không cho phép tự phong Admin |
| **TC-AUTH-03** | Đăng ký với Email đã tồn tại trong hệ thống | Validation / Boundary | **P1** | Báo lỗi email đã được sử dụng (HTTP 409 / Error Toast) |
| **TC-AUTH-04** | Đăng ký thiếu lớp học (`class_id` rỗng hoặc null) | Validation | **P1** | Báo lỗi bắt buộc chọn lớp học, chặn tạo tài khoản |
| **TC-AUTH-05** | Đăng nhập tài khoản Email/Password hợp lệ | Functional / Auth | **P0** | Đăng nhập thành công, sinh chuỗi JWT Token, lưu phiên |
| **TC-AUTH-06** | Đăng nhập sai mật khẩu hoặc tài khoản không tồn tại | Negative / Auth | **P1** | Báo lỗi "Sai thông tin đăng nhập", không tiết lộ email có tồn tại hay không |
| **TC-AUTH-07** | Đăng nhập qua Google OAuth 2.0 (Học sinh mới & Học sinh cũ) | Integration / OAuth | **P1** | User mới bắt buộc chọn lớp; User cũ điều hướng thẳng vào phòng thi |
| **TC-AUTH-08** | Điều hướng theo vai trò (Role Router) & Chặn khách vãng lai | Access Control / Security | **P0** | Học sinh -> Phòng thi; Giáo viên -> Lớp phụ trách; Admin -> Quản trị; Khách -> Chuyển về Login |

---

### CHI TIẾT CÁC TEST CASES

#### TC-AUTH-01: Đăng ký tài khoản học sinh hợp lệ với đầy đủ thông tin và chọn lớp
* **Mục tiêu:** Xác minh học sinh đăng ký tài khoản thành công khi nhập đầy đủ họ tên, email hợp lệ, mật khẩu đủ mạnh và chọn lớp học.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:** Lớp học `10A1` (ID: `uuid-class-10a1`) đang ở trạng thái `is_active = true`. Email `new.student@exam.local` chưa từng đăng ký.
* **Các bước thực hiện:**
  1. Truy cập màn hình đăng ký (`/register`).
  2. Nhập Họ và tên: `Nguyễn Văn An`.
  3. Nhập Email: `new.student@exam.local`.
  4. Nhập Mật khẩu: `MatKhau@123456`.
  5. Chọn Lớp học từ dropdown: `Lớp 10A1`.
  6. Bấm nút **"Đăng ký tài khoản"**.
* **Dữ liệu kiểm thử:**
  ```json
  {
    "full_name": "Nguyễn Văn An",
    "email": "new.student@exam.local",
    "password": "MatKhau@123456",
    "class_id": "uuid-class-10a1"
  }
  ```
* **Kết quả mong đợi:**
  - Giao diện: Hiển thị thông báo đăng ký thành công ("Tài khoản đã tạo thành công"), tự động đăng nhập hoặc điều hướng sang màn hình chọn môn thi.
  - CSDL `public.users`: Tạo 1 bản ghi mới với `email = 'new.student@exam.local'`, `role = 'student'`, `class_id = 'uuid-class-10a1'`.
  - Cột `hash_password` trong CSDL được băm an toàn theo chuẩn BCrypt/Argon2 (bắt đầu bằng `$2a$` hoặc `$2b$`), tuyệt đối không lưu plaintext.

---

#### TC-AUTH-02: Chống tự nâng quyền: Gửi payload đăng ký kèm `role: 'admin'`
* **Mục tiêu:** Xác minh lỗ hổng tự nâng quyền được triệt tiêu hoàn toàn. Người dùng cố tình dùng Postman/cURL hoặc can thiệp payload gửi `role: 'admin'` hoặc `role: 'teacher'` không thể biến mình thành Admin.
* **Độ ưu tiên:** P0 (Critical Security)
* **Tiền điều kiện:** Hệ thống đang chạy, endpoint đăng ký công khai.
* **Các bước thực hiện:**
  1. Mở Postman hoặc gửi yêu cầu HTTP POST trực tiếp đến API đăng ký (`POST /auth/v1/signup` hoặc API backend).
  2. Gửi body chứa trường gian lận: `"role": "admin"` và `"role": "teacher"`.
* **Dữ liệu kiểm thử:**
  ```json
  {
    "full_name": "Hacker Tự Phong",
    "email": "hacker.admin@exam.local",
    "password": "Password123!",
    "class_id": "uuid-class-10a1",
    "role": "admin"
  }
  ```
* **Kết quả mong đợi:**
  - CSDL `public.users`: Bản ghi được tạo phải có `role = 'student'`. Trường `role: 'admin'` gửi lên bị ghi đè hoặc loại bỏ bởi trigger/default value.
  - Sau khi đăng nhập bằng tài khoản này, JWT Token chỉ mang `role = 'student'`.
  - Thử truy cập trang quản trị `/admin` -> Nhận thông báo HTTP 403 Forbidden hoặc bị chuyển hướng về màn hình học sinh.

---

#### TC-AUTH-03: Đăng ký với Email đã tồn tại trong hệ thống
* **Mục tiêu:** Ngăn chặn việc tạo trùng lặp email và kiểm tra thông báo lỗi thân thiện.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Email `hocsinh1@exam.local` đã tồn tại trong bảng `users`.
* **Các bước thực hiện:**
  1. Mở trang đăng ký.
  2. Nhập Email: `hocsinh1@exam.local`.
  3. Điền các thông tin khác hợp lệ -> Bấm "Đăng ký".
* **Kết quả mong đợi:**
  - Hệ thống từ chối đăng ký, không làm thay đổi dữ liệu trong CSDL.
  - Hiển thị thông báo lỗi rõ ràng: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác."

---

#### TC-AUTH-04: Đăng ký thiếu lớp học (`class_id` rỗng)
* **Mục tiêu:** Đảm bảo toàn vẹn nghiệp vụ: Mỗi học sinh bắt buộc phải gắn liền với một lớp học cụ thể để phục vụ việc tính điểm và báo cáo sau này.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Nhập Họ tên, Email mới, Mật khẩu hợp lệ.
  2. Bỏ trống dropdown "Chọn lớp học" (hoặc gửi payload `class_id: null`).
  3. Bấm nút "Đăng ký".
* **Kết quả mong đợi:**
  - Frontend hiển thị cảnh báo đỏ bên dưới ô chọn lớp: "Vui lòng chọn lớp học của bạn".
  - Nút đăng ký bị vô hiệu hóa hoặc API trả về mã lỗi 400 Bad Request: "Lớp học là thông tin bắt buộc đối với học sinh".

---

#### TC-AUTH-05: Đăng nhập tài khoản Email/Password hợp lệ
* **Mục tiêu:** Xác thực tài khoản hợp lệ, phát hành JWT token chứa đúng claim quyền hạn.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:** Tài khoản `hocsinh1@exam.local` / `MatKhau@123` đang ở trạng thái `is_active = true`.
* **Các bước thực hiện:**
  1. Truy cập `/login`.
  2. Nhập Email: `hocsinh1@exam.local`.
  3. Nhập Mật khẩu: `MatKhau@123`.
  4. Bấm "Đăng nhập".
* **Kết quả mong đợi:**
  - Đăng nhập thành công dưới 1 giây.
  - Client nhận JWT Token hợp lệ chứa: `sub` (User UUID), `email`, `role = 'student'`, `class_id`.
  - Hệ thống điều hướng tự động vào trang Phòng thi & Lịch sử cá nhân (`/student/dashboard`).

---

#### TC-AUTH-06: Đăng nhập sai mật khẩu hoặc tài khoản không tồn tại
* **Mục tiêu:** Xác minh cơ chế phòng thủ xác thực: Chống đoán mò tài khoản và không làm lộ thông tin người dùng.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Thử nghiệm 1: Nhập email đúng `hocsinh1@exam.local`, mật khẩu sai `SaiMatKhau123`.
  2. Thử nghiệm 2: Nhập email không tồn tại `khongtontai@exam.local`, mật khẩu bất kỳ.
* **Kết quả mong đợi:**
  - Cả 2 trường hợp đều trả về thông điệp trung tính đồng nhất: "Email hoặc mật khẩu không chính xác."
  - Không cấp token, không tạo phiên đăng nhập.

---

#### TC-AUTH-07: Đăng nhập qua Google OAuth 2.0
* **Mục tiêu:** Xác minh luồng liên kết đăng nhập 1-chạm Google OAuth.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Bấm nút "Sign in with Google".
  2. Xác thực thành công trên màn hình Google Consent.
  3. Trường hợp A (Tài khoản Google mới): Hệ thống yêu cầu bổ sung thông tin "Chọn Lớp học" trước khi hoàn tất hồ sơ.
  4. Trường hợp B (Tài khoản Google đã liên kết trước đó): Tự động đăng nhập và vào thẳng trang chính.
* **Kết quả mong đợi:**
  - Thông tin Google Profile (`email`, `full_name`, `avatar_url`) được đồng bộ chính xác vào bảng `users`.
  - Phân vai trò mặc định `student` và liên kết đúng `class_id`.

---

#### TC-AUTH-08: Điều hướng theo vai trò (Role Router) & Chặn khách vãng lai
* **Mục tiêu:** Đảm bảo tính phân quyền nghiêm ngặt theo 3 vai trò và chặn tuyệt đối khách vãng lai.
* **Độ ưu tiên:** P0 (Blocker)
* **Các bước thực hiện:**
  1. Đăng nhập với tài khoản `student` -> Thử truy cập URL `/admin/dashboard` và `/teacher/classes`.
  2. Đăng nhập với tài khoản `teacher` -> Kiểm tra giao diện chuyển đúng vào `/teacher/dashboard`.
  3. Đăng nhập với tài khoản `admin` -> Kiểm tra giao diện chuyển đúng vào `/admin/dashboard`.
  4. Mở tab ẩn danh (chưa đăng nhập) -> Thử truy cập `/student/exam`, `/teacher/classes`, `/admin/configs`.
* **Kết quả mong đợi:**
  - `student` cố vào trang Admin/Teacher: Bị chặn, hiển thị 403 Forbidden hoặc redirect về `/student/dashboard`.
  - Chưa đăng nhập truy cập bất kỳ route nội bộ nào: Lập tức bị redirect về `/login` kèm thông báo "Vui lòng đăng nhập để tiếp tục".
