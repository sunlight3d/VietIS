# TEST SUITE 08: ĐÓNG GÓP & PHÊ DUYỆT CÂU HỎI 2 CẤP (FLOW 08)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP

> **Tài liệu tham chiếu:** Flow 08 (`exam-app/flows/08-dong-gop-va-phe-duyet-cau-hoi.md`), Lược đồ CSDL v2.4 bảng `questions`, `question_options`, `notifications`.  
> **Mục tiêu:** Kiểm thử quy trình kiểm duyệt câu hỏi 2 cấp hoàn chỉnh: Giáo viên soạn câu hỏi chờ duyệt (`pending`), Admin thẩm định công thức LaTeX và phê duyệt (`approved`) hoặc từ chối (`rejected`) bắt buộc nhập lý do góp ý, và Giáo viên chỉnh sửa lại câu bị từ chối gửi lại thẩm định.  
> **Tổng số Test Cases:** 8 (2 P0, 5 P1, 1 P2)

---

### BẢNG TỔNG HỢP TEST CASES

| Test Case ID | Tên Ca Kiểm Thử | Loại Kiểm Thử | Độ Ưu Tiên | Kết Quả Mong Đợi Tóm Tắt |
| :--- | :--- | :--- | :---: | :--- |
| **TC-QUES-01** | Giáo viên soạn thảo câu hỏi mới gửi thẩm định | Functional / Teacher | **P0** | Câu hỏi lưu thành công ở trạng thái `status = 'pending'`, tạo `notifications` |
| **TC-QUES-02** | Câu hỏi `pending` tuyệt đối không xuất hiện trong đề thi học sinh | Security / Integrity | **P0** | Học sinh vào thi thật/thử không bốc phải câu hỏi đang chờ duyệt |
| **TC-QUES-03** | Admin kiểm tra nội dung và Phê duyệt câu hỏi (`approved`) | Functional / Admin | **P1** | Chuyển sang `approved`, câu hỏi hòa vào ngân hàng đề thi chính thức |
| **TC-QUES-04** | Admin Từ chối câu hỏi (`rejected`) nhưng bỏ trống lý do góp ý | Validation / Negative | **P1** | Bắt buộc nhập lý do từ chối, chặn thao tác nếu lý do để trống |
| **TC-QUES-05** | Admin Từ chối câu hỏi kèm lý do góp ý hợp lệ | Functional / Admin | **P1** | Cập nhật `status = 'rejected'`, lưu `rejection_reason`, gửi thông báo cho giáo viên |
| **TC-QUES-06** | Giáo viên nhận thông báo và xem lý do câu hỏi bị từ chối | Functional / Teacher | **P1** | Tab lịch sử hiển thị huy hiệu CẦN SỬA ĐỔI kèm nội dung góp ý của Admin |
| **TC-QUES-07** | Giáo viên chỉnh sửa lại câu bị từ chối và gửi lại thẩm định | Functional / Workflow | **P1** | Câu hỏi cập nhật nội dung mới, chuyển trạng thái về `pending` để Admin duyệt lại |
| **TC-QUES-08** | Phân quyền bảo mật: Học sinh cố tình gọi API đóng góp hoặc duyệt câu hỏi | Security / Access Control | **P2** | Bị chặn 100% bởi RLS (HTTP 403 Forbidden / Error 42501) |

---

### CHI TIẾT CÁC TEST CASES

#### TC-QUES-01: Giáo viên soạn thảo câu hỏi mới gửi thẩm định
* **Mục tiêu:** Xác minh giáo viên soạn và gửi câu hỏi mới lên hệ thống thành công ở trạng thái chờ duyệt.
* **Độ ưu tiên:** P0 (Blocker)
* **Tiền điều kiện:** Đăng nhập tài khoản Giáo viên Hóa học (`USER_TEACHER_CHEM`).
* **Các bước thực hiện:**
  1. Vào menu **"Đóng góp câu hỏi"** (`/teacher/questions/create`).
  2. Chọn Môn học: `chemistry`.
  3. Nhập Nội dung: "Kim loại nào sau đây tác dụng với nước ở nhiệt độ thường tạo thành dung dịch kiềm và giải phóng khí hidro?".
  4. Nhập 4 phương án: A. Cu, B. Na, C. Fe, D. Ag.
  5. Đánh dấu phương án đúng: B (Na).
  6. Nhập Lời giải chi tiết: "$2Na + 2H_2O \rightarrow 2NaOH + H_2\uparrow$".
  7. Bấm **"Gửi Admin Thẩm Định"**.
* **Kết quả mong đợi:**
  - CSDL `questions`: Tạo 1 bản ghi với `status = 'pending'`, `created_by = teacher.id`.
  - CSDL `question_options`: Tạo 4 bản ghi phương án gắn với câu hỏi này.
  - CSDL `notifications`: Tạo 1 thông báo cho Admin: "Giáo viên Nguyễn Văn A đã gửi 1 câu hỏi mới môn Hóa học chờ duyệt".
  - Giao diện: Thông báo "Câu hỏi đã gửi thành công và đang chờ Admin thẩm định".

---

#### TC-QUES-02: Câu hỏi `pending` tuyệt đối không xuất hiện trong đề thi học sinh
* **Mục tiêu:** Đảm bảo kho đề thi của học sinh chỉ chứa các câu hỏi đã qua kiểm duyệt chuẩn mực.
* **Độ ưu tiên:** P0 (Critical Data Integrity)
* **Tiền điều kiện:** Câu hỏi ở bước TC-QUES-01 đang ở trạng thái `pending`.
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Học sinh.
  2. Bắt đầu 5 lượt thi thử và 5 lượt thi thật môn Hóa học.
  3. Kiểm tra danh sách câu hỏi được bốc ngẫu nhiên trong các lượt thi này.
* **Kết quả mong đợi:**
  - Không có bất kỳ lượt thi nào chứa câu hỏi đang ở trạng thái `pending`.
  - Hàm `fn_get_exam_questions` và trigger bốc đề chỉ query: `WHERE status = 'approved' AND is_deleted = false`.

---

#### TC-QUES-03: Admin kiểm tra nội dung và Phê duyệt câu hỏi (`approved`)
* **Mục tiêu:** Xác minh Admin phê duyệt câu hỏi đạt chuẩn và đưa vào kho đề chính thức.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Đăng nhập tài khoản Admin. Có câu hỏi Hóa học đang `pending`.
* **Các bước thực hiện:**
  1. Mở danh mục "Câu hỏi chờ duyệt" (`/admin/questions/pending`).
  2. Bấm xem chi tiết câu hỏi (kiểm tra nội dung, công thức LaTeX và đáp án).
  3. Bấm nút **"PHÊ DUYỆT (Approve)"**.
* **Kết quả mong đợi:**
  - CSDL `questions`: Cập nhật `status = 'approved'`, `approved_by = admin.id`, `approved_at = now()`.
  - CSDL `notifications`: Tạo thông báo gửi tài khoản Giáo viên: "Câu hỏi môn Hóa của bạn đã được phê duyệt!".
  - Câu hỏi hòa vào kho đề chính thức và sẵn sàng được bốc vào các kỳ thi tiếp theo.

---

#### TC-QUES-04: Admin Từ chối câu hỏi (`rejected`) nhưng bỏ trống lý do góp ý
* **Mục tiêu:** Ràng buộc nghiệp vụ: Bắt buộc Admin phải giải thích lý do khi từ chối câu hỏi để giáo viên có căn cứ sửa đổi.
* **Độ ưu tiên:** P1 (Validation)
* **Các bước thực hiện:**
  1. Admin mở câu hỏi chờ duyệt.
  2. Bấm nút **"TỪ CHỐI (Reject)"**.
  3. Hộp thoại modal mở ra yêu cầu nhập lý do.
  4. Admin để trống ô lý do và bấm "Xác nhận Từ chối".
* **Kết quả mong đợi:**
  - Hệ thống không cho phép lưu, hiển thị thông báo lỗi đỏ: "Vui lòng nhập lý do từ chối và góp ý sửa đổi để hỗ trợ giáo viên hoàn thiện câu hỏi!".
  - Trạng thái câu hỏi vẫn giữ nguyên là `pending`.

---

#### TC-QUES-05: Admin Từ chối câu hỏi kèm lý do góp ý hợp lệ
* **Mục tiêu:** Xác minh quy trình từ chối câu hỏi chưa đạt chuẩn học thuật kèm phản hồi chi tiết.
* **Độ ưu tiên:** P1 (High)
* **Các bước thực hiện:**
  1. Nhập lý do từ chối: "Phương trình phản ứng còn thiếu điều kiện nhiệt độ xúc tác; phương án C bị lỗi chính tả ký hiệu hóa học.".
  2. Bấm "Xác nhận Từ chối".
* **Kết quả mong đợi:**
  - CSDL `questions`: Cập nhật `status = 'rejected'`, `rejection_reason = 'Phương trình phản ứng còn thiếu...'`.
  - Gửi thông báo đến tài khoản Giáo viên biên soạn.
  - Câu hỏi bị loại khỏi hàng đợi duyệt của Admin.

---

#### TC-QUES-06: Giáo viên nhận thông báo và xem lý do câu hỏi bị từ chối
* **Mục tiêu:** Xác minh giáo viên theo dõi được phản hồi từ Admin để nâng cao chất lượng đề.
* **Độ ưu tiên:** P1 (High)
* **Tiền điều kiện:** Câu hỏi vừa bị từ chối ở bước TC-QUES-05.
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Giáo viên.
  2. Kiểm tra chuông thông báo (Notification bell).
  3. Mở tab "Lịch sử đóng góp câu hỏi" (`/teacher/questions/history`).
* **Kết quả mong đợi:**
  - Chuông thông báo có chấm đỏ: "Câu hỏi môn Hóa của bạn chưa được duyệt. Bấm để xem góp ý".
  - Thẻ câu hỏi hiển thị huy hiệu màu ĐỎ: "CẦN SỬA ĐỔI" kèm ô góp ý của Admin màu vàng cam nổi bật.

---

#### TC-QUES-07: Giáo viên chỉnh sửa lại câu bị từ chối và gửi lại thẩm định
* **Mục tiêu:** Xác minh chu trình khép kín: Giáo viên được sửa lại câu bị từ chối và gửi duyệt lại mà không phải tạo câu mới từ đầu.
* **Độ ưu tiên:** P1 (Workflow)
* **Các bước thực hiện:**
  1. Giáo viên bấm nút **"Chỉnh sửa câu hỏi"** tại câu bị từ chối.
  2. Bổ sung điều kiện nhiệt độ vào phương trình phản ứng, sửa lại lỗi chính tả phương án C theo đúng góp ý của Admin.
  3. Bấm **"Gửi Lại Thẩm Định"**.
* **Kết quả mong đợi:**
  - CSDL `questions`: Cập nhật nội dung mới, chuyển trạng thái từ `rejected` về `pending`, xóa hoặc lưu vết `rejection_reason` cũ.
  - Câu hỏi quay trở lại danh sách chờ duyệt của Admin để thẩm định vòng 2.

---

#### TC-QUES-08: Phân quyền bảo mật: Học sinh cố tình gọi API đóng góp hoặc duyệt câu hỏi
* **Mục tiêu:** Đảm bảo học sinh không thể truy cập các endpoint đóng góp hoặc phê duyệt đề thi.
* **Độ ưu tiên:** P2 (Access Control)
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Học sinh.
  2. Thử gửi request HTTP POST đến `/rest/v1/questions` hoặc PATCH đổi `status = 'approved'`.
* **Kết quả mong đợi:**
  - Policy RLS `questions_manage` chặn lại với mã lỗi 42501 (RLS violation) hoặc HTTP 403.
  - Học sinh chỉ có quyền đọc các câu hỏi đã được duyệt trong bài thi của mình.
