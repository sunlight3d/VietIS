# FLOW 08: Quy Trình Giáo Viên Đóng Góp & Admin Phê Duyệt Câu Hỏi

**Độ phức tạp:** Khá  
**Tác nhân chính (Actors):** Giáo viên & Quản trị viên (Admin)  
**Mục tiêu (Purpose):** Quy trình kiểm duyệt câu hỏi 2 cấp hoàn chỉnh: Giáo viên bộ môn soạn câu hỏi mới gửi lên kho đề ở trạng thái 'Chờ duyệt' (Pending). Admin kiểm tra tính chính xác học thuật, cú pháp LaTeX, sau đó bấm Phê duyệt (Approve) hoặc Từ chối (Reject) kèm lý do góp ý để giáo viên sửa đổi.  

---

## 1. Sơ đồ Quy trình (Flowchart)

```mermaid
flowchart TD
    Start([Giáo viên vào mục 'Đóng góp câu hỏi']) --> CreateForm[Soạn câu hỏi: Tiếng Việt, LaTeX, Nhiều đáp án, Giải thích]
    CreateForm --> SubmitDraft[Bấm 'Gửi Admin Thẩm Định']
    SubmitDraft --> SetPending[Hệ thống lưu trạng thái: PENDING - Chờ duyệt]
    
    SetPending --> AdminNotify[Hiển thị thông báo trên Dashboard của Admin]
    AdminNotify --> AdminReview[Admin mở danh mục: 'Câu hỏi chờ thẩm định']
    
    AdminReview --> ReviewScreen[Xem trước nội dung, công thức LaTeX & đáp án]
    ReviewScreen --> AdminDecision{Quyết định của Admin}
    
    AdminDecision -->|Đạt chuẩn| ApproveAction[Bấm 'PHÊ DUYỆT (Approve)']
    ApproveAction --> SetApproved[Cập nhật trạng thái: APPROVED - Đã duyệt]
    SetApproved --> IntegrateBank[Tự động tích hợp vào Ngân hàng đề thi chính thức]
    IntegrateBank --> TeacherApprovedNotify[Thông báo Giáo viên: Câu hỏi đã được duyệt]
    
    AdminDecision -->|Chưa đạt / Sai kiến thức| RejectAction[Bấm 'TỪ CHỐI (Reject)']
    RejectAction --> InputFeedback[Admin bắt buộc nhập Lý do từ chối & Góp ý sửa]
    InputFeedback --> SetRejected[Cập nhật trạng thái: REJECTED - Từ chối]
    SetRejected --> TeacherRejectedNotify[Gửi phản hồi kèm góp ý về tài khoản Giáo viên]
    TeacherRejectedNotify --> EditQuestion[Giáo viên chỉnh sửa lại theo góp ý]
    EditQuestion --> SubmitDraft
```

---

## 2. Mô tả Chi tiết Từng bước (Step-by-Step Execution)

### Bước 1: Soạn thảo câu hỏi đóng góp mới
* **Tác nhân thực hiện:** Giáo viên (Soạn câu hỏi)
* **Mô tả chi tiết:** Giáo viên mở form 'Đóng góp câu hỏi': Chọn môn học, nhập nội dung tiếng Việt, công thức LaTeX, chọn loại 1 đáp án hoặc nhiều đáp án đúng, nhập lời giải chi tiết -> Bấm 'Gửi Admin duyệt'.
* **Giao diện trực quan (UI View):** Trình soạn thảo có khung xem trước trực tiếp công thức hóa học, nút 'Gửi thẩm định'.

### Bước 2: Lưu câu hỏi ở trạng thái PENDING
* **Tác nhân thực hiện:** Hệ thống (Chờ duyệt)
* **Mô tả chi tiết:** Câu hỏi được đánh dấu cờ `status = PENDING`. Câu hỏi này CHƯA được đưa vào đề thi của học sinh, chỉ xuất hiện trong hàng đợi kiểm duyệt của Admin.
* **Giao diện trực quan (UI View):** Dòng thông báo: 'Câu hỏi đã gửi thành công và đang chờ Admin thẩm định'.

### Bước 3: Admin kiểm tra nội dung và công thức
* **Tác nhân thực hiện:** Admin (Thẩm định)
* **Mô tả chi tiết:** Admin mở mục 'Câu hỏi chờ duyệt'. Xem trước nội dung, kiểm tra tính đúng đắn của phương trình phản ứng, cú pháp LaTeX, danh sách đáp án đúng và tính sư phạm của lời giải.
* **Giao diện trực quan (UI View):** Màn hình kiểm duyệt 2 cột: Cột trái xem trước giao diện hiển thị câu hỏi, Cột phải có 2 nút lớn: [Phê duyệt] và [Từ chối].

### Bước 4: Ra quyết định Phê duyệt hoặc Từ chối
* **Tác nhân thực hiện:** Admin (Phê duyệt / Từ chối)
* **Mô tả chi tiết:** • Nếu đạt: Admin bấm 'Phê duyệt', câu hỏi chuyển sang `APPROVED` và hòa vào kho đề chính thức.\n• Nếu chưa đạt: Admin bấm 'Từ chối', mở hộp thoại bắt buộc nhập lý do góp ý và chuyển trạng thái `REJECTED`.
* **Giao diện trực quan (UI View):** Modal nhập lý do từ chối: 'Ví dụ: Cần bổ sung điều kiện nhiệt độ cho phản ứng Hóa học'.

### Bước 5: Giáo viên nhận thông báo kết quả kiểm duyệt
* **Tác nhân thực hiện:** Giáo viên (Nhận phản hồi)
* **Mô tả chi tiết:** Giáo viên theo dõi danh sách câu hỏi của mình: nếu được duyệt sẽ hiển thị huy hiệu xanh; nếu bị từ chối sẽ đọc được phản hồi góp ý của Admin để chỉnh sửa và gửi lại.
* **Giao diện trực quan (UI View):** Tab 'Lịch sử đóng góp' với danh sách câu hỏi kèm huy hiệu: ĐÃ DUYỆT (Xanh) hoặc CẦN SỬA ĐỔI (Đỏ) kèm nút Sửa.

---

## 3. Quy tắc Nghiệp vụ Cần Ghi nhớ (Business Rules)

* Tính toàn vẹn kho đề: Câu hỏi do giáo viên đóng góp bắt buộc phải được Admin phê duyệt mới xuất hiện trong đề thi của học sinh.
* Bắt buộc nhập lý do từ chối: Khi từ chối, Admin phải cung cấp lý do góp ý rõ ràng để hỗ trợ giáo viên hoàn thiện.
* Giáo viên có thể chỉnh sửa lại các câu hỏi bị từ chối và gửi lại yêu cầu thẩm định bất cứ lúc nào.
