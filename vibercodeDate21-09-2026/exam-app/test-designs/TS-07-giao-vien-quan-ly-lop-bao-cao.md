# TEST SUITE 07: PHÂN HỆ GIÁO VIÊN THEO DÕI ĐIỂM, PHÂN TÍCH CÂU SAI & XUẤT BÁO CÁO (FLOW 07)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Flow 07 (`exam-app/flows/07-giao-vien-quan-ly-lop-xuat-bao-cao.md`), Lược đồ CSDL v2.4 bảng `teacher_classes`, `exam_attempts`, `questions`.  
> **Mục tiêu:** Kiểm thử quy trình làm việc độc lập của giáo viên: Cô lập dữ liệu theo môn/lớp phụ trách, xem đầy đủ bài thi (kể cả bài học sinh đã xóa mềm), xem biểu đồ phân tích Top câu làm sai nhiều nhất, và tự chủ xuất báo cáo Excel/PDF mà không cần Admin can thiệp.  
> **Tổng số Test Cases:** 7 (3 P0, 3 P1, 1 P2)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Loại Kiểm Thử | Độ Ưu Tiên | Kết Quả Mong Đợi Tóm Tắt |
| :--- | :--- | :--- | :---: | :--- |
| **TC-TEAC-01** | Cô lập phạm vi dữ liệu: Giáo viên chỉ xem được lớp và môn mình phụ trách | Security / RLS Scope | **P0** | Chỉ hiển thị các lớp trong `teacher_classes`, không xem được lớp của giáo viên khác |
| **TC-TEAC-02** | Xem bảng điểm chi tiết của lớp kèm trạng thái Đạt/Hỏng | Functional | **P1** | Hiển thị đầy đủ danh sách học sinh, điểm số, thẻ Xanh (Đạt) và Đỏ (Chưa đạt) |
| **TC-TEAC-03** | Bảo toàn điểm số: Giáo viên vẫn xem được bài thi mà học sinh đã xóa mềm | Data Integrity | **P0** | Bài thi có `is_student_deleted = true` vẫn xuất hiện 100% trên bảng điểm lớp |
| **TC-TEAC-04** | Biểu đồ phân tích điểm yếu: Thống kê Top câu hỏi học sinh làm sai nhiều nhất | Analytics / Business | **P1** | Hiển thị đúng tỷ lệ phần trăm sai của từng câu (Top 5 - 10 câu có tỷ lệ sai cao nhất) |
| **TC-TEAC-05** | Tự chủ xuất báo cáo bảng điểm lớp ra file Excel (`.xlsx`) | Functional / Export | **P1** | Xuất file Excel chuẩn, mở được trong Microsoft Excel với đầy đủ điểm và xếp loại |
| **TC-TEAC-06** | Tự chủ xuất báo cáo bảng điểm lớp ra file PDF (`.pdf`) | Functional / Export | **P2** | Xuất file PDF bố cục trang in chuẩn A4, hiển thị chữ ký và bảng điểm sắc nét |
| **TC-TEAC-07** | Phân quyền bảo mật: Giáo viên không thể can thiệp sửa cấu hình kỳ thi | Security / Access Control | **P0** | Chặn giáo viên truy cập hoặc sửa các tham số của kỳ thi chung |

---

### CHI TIẾT CÁC TEST CASES

#### TC-TEAC-01: Cô lập phạm vi dữ liệu: Giáo viên chỉ xem được lớp và môn mình phụ trách
* **Mục tiêu:** Xác minh tính bảo mật và phân quyền phạm vi: Giáo viên dạy môn Hóa không thể xem bảng điểm môn Sinh, và không thể xem dữ liệu của lớp mà mình không được phân công.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:**
  - Thầy Nguyễn Văn A (`USER_TEACHER_CHEM`) được phân công dạy Hóa lớp 10A1.
  - Cô Trần Thị B (`USER_TEACHER_BIO`) được phân công dạy Sinh lớp 10A1 và lớp 11B2.
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Thầy Nguyễn Văn A (`gv.hoa@exam.local`).
  2. Mở Dashboard Giáo viên.
  3. Thử tìm kiếm hoặc truy cập đường dẫn trực tiếp: `/teacher/classes/10A1/subject/biology` hoặc `/teacher/classes/11B2`.
* **Kết quả mong đợi:**
  - Danh sách lớp phụ trách chỉ hiển thị duy nhất: "Lớp 10A1 - Môn Hóa học".
  - Thử truy cập môn Sinh hoặc lớp 11B2: Bị chặn, hiển thị 403 Forbidden hoặc thông báo "Bạn không có quyền truy cập dữ liệu của lớp/môn này!".

---

#### TC-TEAC-02: Xem bảng điểm chi tiết của lớp kèm trạng thái Đạt/Hỏng
* **Mục tiêu:** Xác minh giáo viên theo dõi được tiến độ học tập và kết quả bài thi của từng học sinh trong lớp.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Lớp 10A1 có 35 học sinh, vừa hoàn thành bài kiểm tra 1 tiết Hóa học.
* **Các bước thực hiện:**
  1. Thầy A mở lớp 10A1 môn Hóa học.
  2. Bấm vào bài kiểm tra 1 tiết.
* **Kết quả mong đợi:**
  - Bảng dữ liệu hiển thị đầy đủ 35 học sinh: Mã HS, Họ và tên, Số lần làm bài, Điểm cao nhất, Điểm lần gần nhất, Xếp loại học lực.
  - Cột trạng thái: Điểm >= 5.0đ hiển thị huy hiệu XANH LÁ (Đạt); Điểm < 5.0đ hiển thị huy hiệu ĐỎ (Chưa đạt).
  - Có thanh tìm kiếm theo tên học sinh và bộ lọc phân loại Đạt/Chưa đạt.

---

#### TC-TEAC-03: Bảo toàn điểm số: Giáo viên vẫn xem được bài thi mà học sinh đã xóa mềm
* **Mục tiêu:** Xác minh triệt tiêu lỗi "Xóa mềm làm sai báo cáo": Khi học sinh điểm kém bấm xóa bài trên giao diện cá nhân, giáo viên vẫn nhìn thấy bài thi đó trong bảng điểm để đánh giá học lực thực tế.
* **Độ ưu tiên:** P0 (Critical Data Integrity)
* **Tiền điều kiện:** Học sinh Lê Văn C bị điểm 3.5 và đã bấm nút Thùng rác xóa bài trên giao diện của mình (`is_student_deleted = true`).
* **Các bước thực hiện:**
  1. Giáo viên mở bảng điểm chi tiết bài thi của lớp 10A1.
  2. Tìm kiếm học sinh Lê Văn C.
* **Kết quả mong đợi:**
  - Bài thi 3.5 điểm của Lê Văn C VẪN HIỂN THỊ ĐẦY ĐỦ trong bảng điểm của giáo viên.
  - Cột ghi chú có thể hiển thị biểu tượng nhỏ: "[Đã ẩn bởi học sinh]" để giáo viên nắm thông tin, nhưng số điểm 3.5đ vẫn được tính vào điểm trung bình và thống kê phổ điểm của lớp.

---

#### TC-TEAC-04: Biểu đồ phân tích điểm yếu: Thống kê Top câu hỏi học sinh làm sai nhiều nhất
* **Mục tiêu:** Xác minh tính năng tự động phát hiện lỗ hổng kiến thức để giáo viên kịp thời chữa bài.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Cả lớp 10A1 đã làm bài thi Hóa gồm 30 câu hỏi.
* **Các bước thực hiện:**
  1. Giáo viên chuyển sang tab **"Phân tích Điểm yếu & Câu hỏi sai"**.
  2. Quan sát biểu đồ cột.
* **Kết quả mong đợi:**
  - Hệ thống tự động tính tỷ lệ trả lời sai trên tổng số học sinh làm bài theo từng câu hỏi.
  - Hiển thị danh sách Top câu hỏi sai nhiều nhất (Ví dụ: "Câu 14: 78% học sinh chọn sai", "Câu 22: 65% chọn sai").
  - Bấm vào câu hỏi: Mở ngay popup xem nội dung câu hỏi, công thức LaTeX, phương án học sinh hay chọn nhầm và lời giải chuẩn.

---

#### TC-TEAC-05: Tự chủ xuất báo cáo bảng điểm lớp ra file Excel (`.xlsx`)
* **Mục tiêu:** Đảm bảo giáo viên xuất được file bảng điểm chuẩn Excel phục vụ báo cáo ban giám hiệu và lưu trữ ngoại tuyến.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Giáo viên bấm nút **"Xuất Excel (.xlsx)"** màu xanh lá.
  2. Tải file về máy tính và mở bằng Microsoft Excel hoặc Google Sheets.
* **Kết quả mong đợi:**
  - File tải về có tên chuẩn: `Bang_Diem_Lop_10A1_Mon_Hoa_20261007.xlsx`.
  - Dữ liệu trong bảng tính chuẩn UTF-8, không bị lỗi font tiếng Việt, gồm các cột: STT, Mã HS, Họ và tên, Điểm số, Trạng thái (Đạt/Hỏng), Xếp loại.
  - Có dòng tính Điểm trung bình cả lớp và Tỷ lệ Đạt (%).

---

#### TC-TEAC-06: Tự chủ xuất báo cáo bảng điểm lớp ra file PDF (`.pdf`)
* **Mục tiêu:** Kiểm tra chức năng xuất file PDF định dạng trang in chuẩn phục vụ lưu trữ văn bản.
* **Độ ưu tiên:** P2 (Export)
* **Các bước thực hiện:**
  1. Giáo viên bấm nút **"Xuất PDF (.pdf)"** màu đỏ.
  2. Mở file PDF bằng trình đọc PDF.
* **Kết quả mong đợi:**
  - File tải về: `Bao_Cao_Lop_10A1_Mon_Hoa.pdf`.
  - Trang in định dạng khổ A4 dọc, có tiêu đề trường lớp, bảng điểm ngay ngắn, không bị tràn lề, có phần chữ ký của giáo viên bộ môn ở cuối trang.

---

#### TC-TEAC-07: Phân quyền bảo mật: Giáo viên không thể can thiệp sửa cấu hình kỳ thi
* **Mục tiêu:** Đảm bảo giáo viên không có quyền can thiệp vào cấu hình chung của hệ thống (như thay đổi thời lượng thi, số câu hỏi của kỳ thi).
* **Độ ưu tiên:** P0 (Access Control)
* **Các bước thực hiện:**
  1. Giáo viên đăng nhập.
  2. Thử truy cập trang `/admin/exams` hoặc gửi request PATCH đến `exam_configs`.
* **Kết quả mong đợi:**
  - Hệ thống chặn truy cập, thông báo "Bạn không có quyền quản trị cấu hình kỳ thi".
  - Bảng `exam_configs` được bảo vệ an toàn.
