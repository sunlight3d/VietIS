# TEST SUITE 09: QUẢN TRỊ NGÂN HÀNG CÂU HỎI & IMPORT HÀNG LOẠT TỪ EXCEL (FLOW 09)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Flow 09 (`exam-app/flows/09-quan-tri-cau-hoi-import-excel.md`), Lược đồ CSDL v2.4 bảng `questions`, `question_options`, `question_import_logs`.  
> **Mục tiêu:** Kiểm thử quản trị toàn diện kho đề thi 3 môn (Hóa, Sinh, Tiếng Anh): Thêm sửa thủ công, tải template mẫu, upload và validation file Excel tự động (cú pháp LaTeX, cột Correct_Answers), xóa mềm đơn lẻ và hàng loạt (`is_deleted = true`), bảo toàn dữ liệu bài thi cũ của học sinh.  
> **Tổng số Test Cases:** 9 (3 P0, 4 P1, 2 P2)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Loại Kiểm Thử | Độ Ưu Tiên | Kết Quả Mong Đợi Tóm Tắt |
| :--- | :--- | :--- | :---: | :--- |
| **TC-IMPT-01** | Tải file mẫu chuẩn `Mau_Import_Cau_Hoi.xlsx` | Functional / UI | **P2** | File tải về đúng cấu trúc các cột và sheet hướng dẫn |
| **TC-IMPT-02** | Upload file Excel câu hỏi hợp lệ 100% và nạp vào CSDL | Integration / Import | **P0** | Quét thành công, nạp toàn bộ câu hỏi và options, ghi log `question_import_logs` |
| **TC-IMPT-03** | Validation file Excel: Cột `Correct_Answers` không khớp với các phương án | Validation / Negative | **P1** | Báo đỏ dòng lỗi: Đáp án đúng 'E' không tồn tại trong các phương án A, B, C, D |
| **TC-IMPT-04** | Validation file Excel: Cú pháp công thức LaTeX bị lỗi hoặc thiếu dấu `$` | Validation / Format | **P1** | Báo lỗi dòng chứa công thức không hợp lệ, yêu cầu sửa lại |
| **TC-IMPT-05** | Thêm mới câu hỏi thủ công có công thức LaTeX và xem trước | Functional / Admin | **P1** | Trình soạn thảo hiển thị preview công thức sắc nét, lưu thành công |
| **TC-IMPT-06** | Xóa đơn lẻ 1 câu hỏi bằng cơ chế Xóa mềm (`is_deleted = true`) | Functional / Soft Delete | **P1** | Câu hỏi bị ẩn khỏi ngân hàng đề nhưng bản ghi vẫn tồn tại trong CSDL |
| **TC-IMPT-07** | Xóa hàng loạt câu hỏi (Bulk Delete) bằng hộp thoại xác nhận 2 lớp | Functional / Bulk Action | **P1** | Tích chọn nhiều câu, xác nhận modal -> Cập nhật `is_deleted = true` hàng loạt |
| **TC-IMPT-08** | Bảo toàn lịch sử bài thi cũ khi câu hỏi bị xóa mềm | Data Integrity | **P0** | Bài thi cũ trong quá khứ không bị mất câu hỏi, không bị lỗi khóa ngoại |
| **TC-IMPT-09** | Câu hỏi đã xóa mềm bị ẩn hoàn toàn với Giáo viên và Đề thi mới | Security / RLS Filter | **P0** | Policy RLS lọc `is_deleted = false`, giáo viên không thấy câu đã bị Admin xóa mềm |

---

### CHI TIẾT CÁC TEST CASES

#### TC-IMPT-01: Tải file mẫu chuẩn `Mau_Import_Cau_Hoi.xlsx`
* **Mục tiêu:** Đảm bảo Admin tải được file template chuẩn để điền dữ liệu đúng quy cách.
* **Độ ưu tiên:** P2 (Low)
* **Các bước thực hiện:**
  1. Admin vào mục "Ngân hàng câu hỏi" (`/admin/questions`).
  2. Bấm nút **"Tải File Mẫu (.xlsx)"**.
  3. Mở file tải về kiểm tra cấu trúc.
* **Kết quả mong đợi:**
  - File tải về: `Mau_Import_Cau_Hoi.xlsx`.
  - Chứa đầy đủ các cột chuẩn: `STT`, `Mon_Hoc`, `Do_Kho`, `Loai_Cau_Hoi`, `Noi_Dung_Cau_Hoi`, `Phuong_An_A`, `Phuong_An_B`, `Phuong_An_C`, `Phuong_An_D`, `Correct_Answers`, `Loi_Giai_Chi_Tiet`.
  - Có Sheet 2 giải thích quy tắc điền mã môn và công thức LaTeX.

---

#### TC-IMPT-02: Upload file Excel câu hỏi hợp lệ 100% và nạp vào CSDL
* **Mục tiêu:** Xác minh tính năng nạp hàng loạt 50 câu hỏi từ file Excel vào CSDL.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:** File `De_Hoa_Hoc_50_Cau_Chuan.xlsx` chứa 50 câu hỏi môn Hóa học hợp lệ (đầy đủ nội dung, LaTeX kẹp giữa cặp dấu `$`, đáp án đúng A, B, C, D chuẩn).
* **Các bước thực hiện:**
  1. Bấm nút **"Nhập từ file Excel"**.
  2. Kéo thả file `De_Hoa_Hoc_50_Cau_Chuan.xlsx` vào khung tải lên.
  3. Hệ thống tiến hành quét tự động (Validation).
  4. Bảng xem trước hiển thị: "50/50 câu hợp lệ. Sẵn sàng lưu".
  5. Bấm nút **"Xác nhận Lưu vào CSDL"**.
* **Kết quả mong đợi:**
  - Bảng `questions`: Tạo 50 bản ghi mới với `status = 'approved'`, `subject = 'chemistry'`, `is_deleted = false`.
  - Bảng `question_options`: Tạo 200 bản ghi phương án tương ứng (mỗi câu 4 phương án).
  - Bảng `question_import_logs`: Ghi nhận 1 bản ghi lịch sử nạp: `file_name`, `total_imported = 50`, `created_by = admin.id`.
  - Hiển thị Toast thông báo: "Đã nhập thành công 50 câu hỏi vào ngân hàng đề!".

---

#### TC-IMPT-03: Validation file Excel: Cột `Correct_Answers` không khớp với các phương án
* **Mục tiêu:** Phát hiện và ngăn chặn nạp các câu hỏi có đáp án đúng sai lệch (ví dụ: gõ nhầm chữ 'E' hoặc ký tự lạ).
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** File Excel có dòng 12 ghi `Correct_Answers = E`, dòng 25 ghi `Correct_Answers = 1`.
* **Các bước thực hiện:**
  1. Tải file lỗi lên hệ thống.
  2. Quan sát bảng kết quả quét lỗi.
* **Kết quả mong đợi:**
  - Hệ thống dừng lại không cho lưu vào CSDL.
  - Báo đỏ danh sách dòng bị lỗi:
    - "Dòng 12: Đáp án đúng 'E' không khớp với bất kỳ phương án nào (A, B, C, D)".
    - "Dòng 25: Đáp án đúng '1' không hợp lệ. Vui lòng nhập ký tự chữ cái A, B, C hoặc D".
  - Nút "Xác nhận Lưu" bị vô hiệu hóa cho đến khi file được sửa lại.

---

#### TC-IMPT-04: Validation file Excel: Cú pháp công thức LaTeX bị lỗi
* **Mục tiêu:** Đảm bảo công thức toán/hóa tuân thủ định dạng kẹp giữa cặp dấu `$` để không gây lỗi vỡ màn hình.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** File Excel có dòng 8 chứa công thức mở thiếu dấu đóng: `H2SO4 $ + NaOH \rightarrow ...` (thiếu dấu `$` kết thúc).
* **Các bước thực hiện:**
  1. Tải file lên và quét dữ liệu.
* **Kết quả mong đợi:**
  - Hệ thống cảnh báo: "Dòng 8: Phát hiện thẻ LaTeX mở không có thẻ đóng tương ứng. Vui lòng kiểm tra lại cặp dấu $...$!".

---

#### TC-IMPT-05: Thêm mới câu hỏi thủ công có công thức LaTeX và xem trước
* **Mục tiêu:** Xác minh chức năng thêm câu hỏi lẻ với trình soạn thảo trực quan.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Admin bấm nút "Thêm câu hỏi".
  2. Gõ nội dung có công thức: "Cho phương trình $C_2H_4 + Br_2 \rightarrow C_2H_4Br_2$.".
  3. Quan sát khung "Xem trước trực tiếp (Live Preview)" bên cạnh.
* **Kết quả mong đợi:**
  - Khung xem trước tức thời render công thức hóa học sắc nét theo chuẩn KaTeX.
  - Bấm "Lưu câu hỏi" -> Bản ghi lưu thành công vào CSDL.

---

#### TC-IMPT-06: Xóa đơn lẻ 1 câu hỏi bằng cơ chế Xóa mềm (`is_deleted = true`)
* **Mục tiêu:** Xác minh câu hỏi bị xóa được đánh dấu xóa mềm, không xóa cứng (Hard Delete) khỏi database.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Câu hỏi `QUESTION_CHEM_10` đang hiển thị trên danh sách.
* **Các bước thực hiện:**
  1. Bấm icon thùng rác tại câu hỏi `QUESTION_CHEM_10`.
  2. Modal hiển thị: "Hệ thống sẽ áp dụng Xóa mềm để lưu trữ trọn vẹn lịch sử thi của học sinh. Bạn có chắc chắn?".
  3. Bấm "Xác nhận Xóa".
* **Kết quả mong đợi:**
  - CSDL `questions`: Bản ghi vẫn tồn tại, cột `is_deleted = true`, `deleted_at = now()`.
  - Giao diện: Câu hỏi biến mất khỏi bảng ngân hàng câu hỏi.

---

#### TC-IMPT-07: Xóa hàng loạt câu hỏi (Bulk Delete)
* **Mục tiêu:** Xác minh tính năng dọn dẹp kho đề tiện lợi bằng hộp thoại xác nhận 2 lớp.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Tích chọn checkbox ở 5 câu hỏi môn Sinh học.
  2. Thanh công cụ hiển thị nút nổi bật: **"Xóa 5 câu đã chọn (Bulk Delete)"**.
  3. Bấm nút -> Hộp thoại xác nhận 2 lớp yêu cầu gõ chữ "XAC NHAN" để xóa.
  4. Admin gõ "XAC NHAN" và bấm Đồng ý.
* **Kết quả mong đợi:**
  - CSDL cập nhật `is_deleted = true` cho cả 5 câu hỏi cùng lúc trong 1 transaction.
  - Danh sách màn hình được làm mới, 5 câu hỏi bị ẩn đi.

---

#### TC-IMPT-08: Bảo toàn lịch sử bài thi cũ khi câu hỏi bị xóa mềm
* **Mục tiêu:** Xác minh triệt tiêu lỗi "Mất lịch sử khi xóa câu hỏi": Các bài thi của học sinh làm trước đây có chứa câu hỏi bị xóa mềm vẫn xem lại được bình thường.
* **Độ ưu tiên:** P0 (Critical Data Integrity)
* **Tiền điều kiện:** Học sinh A đã từng làm bài thi có chứa câu hỏi `QUESTION_CHEM_10` (ở bước TC-IMPT-06, câu này hiện đã có `is_deleted = true`).
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Học sinh A -> Vào Lịch sử làm bài.
  2. Mở chi tiết bài thi cũ để xem lại qua `fn_get_attempt_review`.
* **Kết quả mong đợi:**
  - Bài thi hiển thị đầy đủ, không bị lỗi thiếu câu hỏi, không bị lỗi trắng trang.
  - Nội dung câu hỏi `QUESTION_CHEM_10` và các phương án vẫn hiển thị nguyên vẹn (nhờ ràng buộc `ON DELETE RESTRICT` và việc chỉ cập nhật cờ `is_deleted = true`).

---

#### TC-IMPT-09: Câu hỏi đã xóa mềm bị ẩn hoàn toàn với Giáo viên và Đề thi mới
* **Mục tiêu:** Khắc phục triệt để Warning 6: Đảm bảo câu hỏi bị Admin xóa mềm không còn xuất hiện trong danh sách câu hỏi hoạt động của giáo viên và không bị bốc vào đề thi mới.
* **Độ ưu tiên:** P0 (Security & Data Consistency)
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Giáo viên bộ môn.
  2. Mở danh sách câu hỏi của môn học (`/teacher/questions`).
  3. Học sinh tạo 1 lượt thi thật mới.
* **Kết quả mong đợi:**
  - Danh sách của giáo viên KHÔNG chứa bất kỳ câu hỏi nào có `is_deleted = true` (Policy RLS `questions_select` lọc điều kiện `is_deleted = false`).
  - Đề thi mới của học sinh không bốc câu hỏi đã bị xóa mềm.
