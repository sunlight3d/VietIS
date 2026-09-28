# ExamApp Frontend - Flow 01 (Đăng Ký & Đăng Nhập)

Ứng dụng Frontend được xây dựng dựa trên đặc tả của **Flow 01: Đăng ký & Đăng nhập Hệ thống (Email & Google OAuth)** cho hệ thống thi trắc nghiệm trực tuyến 3 môn: **Hóa học, Sinh học, Tiếng Anh**.

---

## 🎨 Bảng Màu Chủ Đạo (Brand Palette)
Theo đúng yêu cầu thiết kế:
* **Màu cam sáng:** `#F26B38` (Nút hành động chính, điểm nhấn, CTA Đăng nhập)
* **Màu xanh mòng két:** `#0B8374` (Màu thương hiệu chính, CTA Đăng ký, huy hiệu môn học)
* **Chữ & Viền xám tối / nhạt:** `#CBE5DF` (Màu text phụ, viền thẻ mờ, nền dịu mắt trên Dark Mode)
* **Chế độ Giao diện:** Hỗ trợ đầy đủ **Light Mode** và **Dark Mode** chuyển đổi 1-chạm.

---

## ⚡ Tech Stack
* **Framework:** Next.js (App Router, Turbopack, TypeScript)
* **Styling:** Tailwind CSS (Responsive hoàn hảo Mobile, Tablet, Desktop)
* **Icons:** `lucide-react`
* **Hiệu ứng:** `canvas-confetti` (pháo hoa chúc mừng khi đăng ký / đăng nhập thành công)

---

## 🚀 Hướng Dẫn Chạy Ứng Dụng

Di chuyển vào thư mục `exam-app/frontend`:

```bash
cd exam-app/frontend
pnpm dev
# hoặc
npm run dev
```

Mở trình duyệt và truy cập: **`http://localhost:3000`**

---

## 🌟 Các Tính Năng Đã Hoàn Thiện Trong Giao Diện (Frontend Only)

1. **Đăng nhập (Sign In):**
   * Đăng nhập 1-chạm bằng tài khoản **Google OAuth 2.0**
   * Nhập Email & Mật khẩu có nút **Ẩn / Hiện mật khẩu**
   * Checkbox "Ghi nhớ đăng nhập"
   * Modal **"Quên mật khẩu?"** quy trình 3 bước (Nhập email $\rightarrow$ Nhập OTP $\rightarrow$ Đặt lại mật khẩu)
   * **3 Nút Đăng nhập Nhanh Demo Roles:**
     * `🎓 Thí sinh`: Xem phòng thi 3 môn và lịch sử bài thi (mã màu Xanh / Đỏ)
     * `👩‍🏫 Giáo viên`: Xem danh sách lớp phụ trách, nút xuất Excel / PDF
     * `⚡ Quản trị`: Xem bảng điều khiển quản trị, duyệt câu hỏi, cấu hình đề thi

2. **Đăng ký Tài khoản (Sign Up):**
   * Đăng ký nhanh bằng Google
   * Nhập Họ tên, Email
   * **Dropdown Phân lớp học sinh bắt buộc** (theo nghiệp vụ: 10A1, 10A2, 11B1, 12A1...)
   * Mật khẩu mới có **Thanh đo độ mạnh mật khẩu (Password Strength Meter)**
   * Xác nhận mật khẩu có kiểm tra khớp thời gian thực
   * Checkbox Điều khoản phòng thi & Chính sách bảo mật

3. **Mô phỏng Giao diện Sau Xác Thực (Role Dashboard Simulator):**
   * Sau khi đăng nhập, màn hình chuyển cảnh mượt mà sang giao diện tương ứng theo vai trò (Học viên, Giáo viên, Admin)
   * Nút **Đăng xuất** để quay trở lại form đăng nhập bất cứ lúc nào

4. **Widget Theo Dõi 5 Bước Của Flow 01 (FlowStepsVisualizer):**
   * Hiển thị trực quan trạng thái tiến trình 5 bước theo đúng tài liệu `01-dang-ky-dang-nhap.md`.
