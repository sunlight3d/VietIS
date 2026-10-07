# TEST SUITE 10: BẢNG XẾP HẠNG TOP ĐIỂM, DASHBOARD ĐÁNH GIÁ GIÁO VIÊN & BÁO CÁO (FLOW 10)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Flow 10 (`exam-app/flows/10-bang-xep-hang-dashboard-bao-cao.md`), Lược đồ CSDL v2.4 views `view_leaderboard`, `view_class_performance`, bảng `exam_attempts`.  
> **Mục tiêu:** Kiểm thử chức năng khai thác phân tích dữ liệu toàn trường: Bảng xếp hạng theo học sinh (lấy lượt thi tốt nhất), các nút xem nhanh Top 10/20/50 và ô nhập số lượng tùy biến có kiểm tra validation số nguyên dương, bộ lọc đa tiêu chí điểm số/thời gian, tính cả bài `timed_out` và bài thi thử, dashboard so sánh các lớp theo môn học để đánh giá giáo viên, và xuất báo cáo tổng hợp.  
> **Tổng số Test Cases:** 8 (2 P0, 4 P1, 2 P2)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Loại Kiểm Thử | Độ Ưu Tiên | Kết Quả Mong Đợi Tóm Tắt |
| :--- | :--- | :--- | :---: | :--- |
| **TC-DASH-01** | Bảng xếp hạng tính theo học sinh (Lấy lượt thi có điểm số cao nhất) | Business Logic / View | **P0** | Mỗi học sinh chỉ xuất hiện 1 dòng duy nhất với điểm cao nhất, xếp hạng chính xác |
| **TC-DASH-02** | Xem nhanh bảng xếp hạng qua các nút bấm: Top 10, Top 20, Top 50 | Functional / UI | **P1** | Bấm nút trích xuất ngay danh sách tương ứng dưới 0.5s, gán đúng huy chương Vàng/Bạc/Đồng |
| **TC-DASH-03** | Ô nhập số lượng tùy biến (Textbox): Kiểm tra Validation số nguyên dương | Validation / Boundary | **P1** | Chặn nhập số âm, số thập phân, chữ cái; chỉ chấp nhận số nguyên dương (VD: 15, 100) |
| **TC-DASH-04** | Bảng xếp hạng bao gồm cả các bài tự nộp khi hết giờ (`timed_out`) | Data Integrity | **P0** | Thí sinh có bài thi tự nộp điểm cao vẫn được vinh danh trong bảng xếp hạng |
| **TC-DASH-05** | Bộ lọc & sắp xếp đa tiêu chí (Thời gian làm bài, Điểm số, Lớp, Môn) | Functional / Filter | **P1** | Sắp xếp mượt mà theo điểm (cao <-> thấp), thời gian (nhanh <-> chậm), lọc chuẩn |
| **TC-DASH-06** | Dashboard So sánh các Lớp theo Môn học phục vụ Đánh giá Giáo viên | Analytics / Chart | **P1** | Biểu đồ cột thể hiện điểm trung bình giữa các lớp, phản ánh hiệu quả giảng dạy |
| **TC-DASH-07** | Xuất Báo cáo Tổng hợp toàn trường ra file Excel (`.xlsx`) | Functional / Export | **P2** | File Excel tổng hợp đầy đủ số liệu phổ điểm, tỷ lệ đạt/hỏng, xếp loại toàn trường |
| **TC-DASH-08** | Chuẩn 3 vai trò: Xác minh không tồn tại vai trò "Ban giám hiệu" riêng | Security / Access Control | **P2** | Toàn bộ chức năng giám sát toàn trường do Admin đảm nhiệm theo đúng đặc tả 3 vai trò |

---

### CHI TIẾT CÁC TEST CASES

#### TC-DASH-01: Bảng xếp hạng tính theo học sinh (Lấy lượt thi tốt nhất)
* **Mục tiêu:** Xác minh quyết định thiết kế CSDL: "Bảng xếp hạng tính THEO HỌC SINH (lấy lượt thi điểm cao nhất của từng học sinh)", không hiển thị trùng lặp 1 học sinh nhiều lần nếu thi nhiều lượt.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:**
  - Học sinh A thi môn Hóa 3 lần với các điểm số: 7.0đ, 9.5đ, 8.0đ.
  - Học sinh B thi môn Hóa 2 lần: 8.5đ, 9.0đ.
  - Học sinh C thi 1 lần: 9.0đ nhưng thời gian làm bài nhanh hơn Học sinh B.
* **Các bước thực hiện:**
  1. Mở Bảng xếp hạng môn Hóa học (`view_leaderboard`).
* **Kết quả mong đợi:**
  - Học sinh A chỉ xuất hiện 1 dòng duy nhất ở vị trí Top 1 với điểm số `9.5` điểm.
  - Học sinh B và C cùng được 9.0đ: Học sinh C xếp trên Học sinh B do có thời gian làm bài ngắn hơn (`time_spent_seconds` ít hơn).
  - Không có tình trạng 1 học sinh chiếm nhiều vị trí trong Top.

---

#### TC-DASH-02: Xem nhanh bảng xếp hạng qua các nút bấm: Top 10, Top 20, Top 50
* **Mục tiêu:** Kiểm tra độ phản hồi nhanh của các nút chức năng và gán huy chương Top đầu.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Admin bấm nút **[Top 10]** -> Quan sát danh sách.
  2. Bấm nút **[Top 20]** -> Quan sát danh sách.
  3. Bấm nút **[Top 50]** -> Quan sát danh sách.
* **Kết quả mong đợi:**
  - Danh sách trích xuất chính xác số lượng thí sinh tương ứng: 10, 20, 50 học sinh dẫn đầu.
  - Top 1 hiển thị Icon Huy chương Vàng 🥇 kèm hiệu ứng nổi bật.
  - Top 2 hiển thị Huy chương Bạc 🥈.
  - Top 3 hiển thị Huy chương Đồng 🥉.

---

#### TC-DASH-03: Ô nhập số lượng tùy biến: Validation số nguyên dương
* **Mục tiêu:** Xác minh ô nhập số lượng Top thí sinh có bộ lọc dữ liệu chặt chẽ, chống crash hệ thống.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Nhập số `15` -> Bấm [Xem].
  2. Nhập số `-5` -> Bấm [Xem].
  3. Nhập số `0` -> Bấm [Xem].
  4. Nhập chuỗi `abc` hoặc `12.5` -> Bấm [Xem].
  5. Nhập số cực lớn: `999999` -> Bấm [Xem].
* **Kết quả mong đợi:**
  - Bước 1: Trích xuất chính xác Top 15 thí sinh.
  - Bước 2, 3, 4: Báo lỗi đỏ ngay dưới ô nhập: "Vui lòng nhập một số nguyên dương hợp lệ (lớn hơn 0)!". Không gửi request lỗi về CSDL.
  - Bước 5: Hệ thống tự động giới hạn (Cap) ở tổng số học sinh hiện có của kỳ thi, không làm sập server.

---

#### TC-DASH-04: Bảng xếp hạng bao gồm cả các bài tự nộp khi hết giờ (`timed_out`)
* **Mục tiêu:** Xác minh khắc phục lỗi: "Bài tự nộp do hết giờ không xuất hiện trong bảng xếp hạng".
* **Độ ưu tiên:** P0 (Critical Data Integrity)
* **Tiền điều kiện:** Học sinh D làm bài kiểm tra môn Sinh được 9.0 điểm, nhưng bị hết giờ và bài thi tự nộp (`status = 'timed_out'`).
* **Các bước thực hiện:**
  1. Mở Bảng xếp hạng môn Sinh học.
  2. Kiểm tra danh sách dẫn đầu.
* **Kết quả mong đợi:**
  - Học sinh D VẪN XUẤT HIỆN trong Bảng xếp hạng tại vị trí tương ứng với điểm số 9.0đ.
  - Câu query `view_leaderboard` bao gồm cả `status IN ('completed', 'timed_out')`.

---

#### TC-DASH-05: Bộ lọc & sắp xếp đa tiêu chí
* **Mục tiêu:** Xác minh công cụ lọc đa chiều giúp Admin và Giáo viên tra cứu dữ liệu linh hoạt.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Chọn Dropdown Lớp: `Lớp 10A1`.
  2. Chọn Dropdown Môn: `Tiếng Anh`.
  3. Chọn Sắp xếp: Thời gian làm bài từ `Nhanh nhất -> Chậm nhất`.
* **Kết quả mong đợi:**
  - Danh sách chỉ lọc ra các học sinh thuộc Lớp 10A1 đã thi Tiếng Anh.
  - Thứ tự sắp xếp tăng dần theo `time_spent_seconds`. Thí sinh hoàn thành nhanh nhất đứng đầu.

---

#### TC-DASH-06: Dashboard So sánh các Lớp theo Môn học phục vụ Đánh giá Giáo viên
* **Mục tiêu:** Xác minh dữ liệu so sánh trực quan hỗ trợ công tác quản lý và đánh giá chất lượng dạy học.
* **Độ ưu tiên:** P1 (Analytics)
* **Tiền điều kiện:** Khối 10 có 3 lớp 10A1, 10A2, 10A3 đều đã thi môn Hóa học.
* **Các bước thực hiện:**
  1. Admin mở mục **"Dashboard Đánh giá & Giám sát Giáo viên"** (`/admin/analytics/teachers`).
  2. Chọn Môn: Hóa học.
* **Kết quả mong đợi:**
  - Biểu đồ cột trực quan so sánh Điểm trung bình môn Hóa giữa 3 lớp:
    - Lớp 10A1 (Thầy A phụ trách): 8.2đ (Tỷ lệ đạt 95%).
    - Lớp 10A2 (Thầy A phụ trách): 7.9đ (Tỷ lệ đạt 91%).
    - Lớp 10A3 (Thầy E phụ trách): 6.1đ (Tỷ lệ đạt 70%).
  - Bảng tổng hợp hiển thị chỉ số đánh giá mức độ hiệu quả giảng dạy của giáo viên phụ trách.

---

#### TC-DASH-07: Xuất Báo cáo Tổng hợp toàn trường ra file Excel (`.xlsx`)
* **Mục tiêu:** Đảm bảo xuất đầy đủ số liệu báo cáo phục vụ lưu trữ văn thư và hội nghị tổng kết.
* **Độ ưu tiên:** P2 (Export)
* **Các bước thực hiện:**
  1. Admin bấm nút **"Xuất Báo Cáo Tổng Hợp Excel"**.
  2. Mở file Excel kiểm tra.
* **Kết quả mong đợi:**
  - File tải về: `Bao_Cao_Tong_Hop_Ky_Thi_Toan_Truong_2026.xlsx`.
  - Có 3 sheet:
    - Sheet 1: Tổng quan (Tổng thí sinh, Điểm trung bình, Tỷ lệ Đạt toàn trường).
    - Sheet 2: Bảng xếp hạng Top điểm cao.
    - Sheet 3: Bảng so sánh chất lượng giữa các lớp và giáo viên phụ trách.

---

#### TC-DASH-08: Chuẩn 3 vai trò: Xác minh không tồn tại vai trò "Ban giám hiệu" riêng
* **Mục tiêu:** Khắc phục triệt để mâu thuẫn yêu cầu: Hệ thống chỉ có 3 vai trò chuẩn `student`, `teacher`, `admin`. Toàn bộ chức năng giám sát toàn trường và đánh giá giáo viên thuộc về quyền hạn của `admin`.
* **Độ ưu tiên:** P2 (Architecture)
* **Các bước thực hiện:**
  1. Kiểm tra enum `user_role` trong CSDL PostgreSQL.
  2. Kiểm tra màn hình quản lý phân quyền Admin.
* **Kết quả mong đợi:**
  - Enum `user_role` chỉ gồm đúng 3 giá trị: `'student'`, `'teacher'`, `'admin'`.
  - Không có vai trò dư thừa `principal` hay `board_of_directors`.
  - Tài khoản Admin có toàn quyền truy cập phân hệ Giám sát & Báo cáo cấp trường.
