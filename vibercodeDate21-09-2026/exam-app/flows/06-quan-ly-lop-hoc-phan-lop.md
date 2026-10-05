# FLOW 06: Admin Quản Lý Lớp Học, Import Học Sinh & Phân Công Giáo Viên

**Độ phức tạp:** Khá  
**Tác nhân chính (Actors):** Quản trị viên (Admin)  
**Mục tiêu (Purpose):** Quản lý cơ cấu tổ chức lớp học: Tạo lớp học mới, Import danh sách học sinh vào lớp từ file Excel/CSV, phân công giáo viên bộ môn phụ trách lớp theo từng môn học (Hóa/Sinh/Anh) và thực hiện chuyển lớp khi có sự điều chuyển mà vẫn bảo lưu toàn vẹn lịch sử bài thi.  

---

## 1. Sơ đồ Quy trình (Flowchart)

```mermaid
flowchart TD
    Start([Admin vào mục 'Quản lý Lớp học & Học sinh']) --> ClassHub{Lựa chọn Nghiệp vụ}
    
    ClassHub -->|Tạo Lớp mới| CreateClassForm[Nhập Mã lớp, Tên lớp, Khối, Niên khóa: VD 10A1 - 2026-2027]
    CreateClassForm --> SaveNewClass[Lưu lớp học mới vào CSDL]
    
    ClassHub -->|Phân công Giáo viên| AssignTeacherModal[Chọn Lớp & Gán Giáo viên phụ trách theo Môn]
    AssignTeacherModal --> MapTeacher[Gán: Thầy A dạy Hóa, Cô B dạy Sinh, Thầy C dạy Anh]
    MapTeacher --> SaveTeacherScope[Lưu vào bảng teacher_classes]
    
    ClassHub -->|Quản lý Học sinh| StudentRoster[Mở danh sách học sinh của Lớp]
    StudentRoster --> StudentActions{Thao tác học sinh}
    
    StudentActions -->|Import Danh sách từ Excel| DownloadTpl[Tải file mẫu Excel: Mã HS, Họ tên, Email, SĐT]
    DownloadTpl --> UploadExcel[Admin tải lên file Excel danh sách học sinh]
    UploadExcel --> ValidateStudentData{Kiểm tra dữ liệu & Trùng email}
    ValidateStudentData -->|Có lỗi định dạng| ShowImportErrors[Hiện danh sách dòng lỗi để sửa]
    ValidateStudentData -->|Hợp lệ| BulkInsertStudents[Tự động tạo tài khoản Student & Gán vào lớp]
    BulkInsertStudents --> ImportSuccessToast[Thông báo: Nạp thành công N học sinh vào lớp]
    
    StudentActions -->|Thêm học sinh lẻ| AddStudent[Nhập tay thông tin học sinh đơn lẻ]
    StudentActions -->|Chuyển Lớp| TransferClassModal[Chọn Học sinh -> Chọn Lớp Đích mới]
    
    TransferClassModal --> ConfirmTransfer[Xác nhận Chuyển lớp: VD từ 10A1 sang 10A2]
    ConfirmTransfer --> UpdateStudentClass[Cập nhật class_id mới cho học sinh]
    UpdateStudentClass --> KeepHistory[(Bảo lưu 100% lịch sử điểm thi cũ trong DB)]
    KeepHistory --> SuccessNotice[Thông báo chuyển lớp thành công]
```

---

## 2. Mô tả Chi tiết Từng bước (Step-by-Step Execution)

### Bước 1: Mở danh mục Quản lý Lớp học
* **Tác nhân thực hiện:** Admin (Truy cập)
* **Mô tả chi tiết:** Admin truy cập phân hệ Quản lý Lớp học. Màn hình hiển thị danh sách các lớp học hiện có, số lượng học sinh trong lớp và danh sách giáo viên phụ trách từng môn.
* **Giao diện trực quan (UI View):** Bảng danh sách lớp học hiện đại, có các nút: 'Tạo Lớp mới', 'Import Học sinh từ Excel', 'Phân công Giáo viên', 'Danh sách Học sinh'.

### Bước 2: Tạo mới lớp học và thiết lập niên khóa
* **Tác nhân thực hiện:** Admin (Tạo lớp)
* **Mô tả chi tiết:** Admin bấm 'Tạo lớp mới'. Điền thông tin: Mã lớp (10A1), Tên lớp (Lớp 10A1 Chuyên Tự Nhiên), Khối (10), Niên khóa (2026-2027) -> Bấm Lưu.
* **Giao diện trực quan (UI View):** Modal tạo lớp đơn giản, có ô chọn khối, niên khóa và ghi chú.

### Bước 3: Import danh sách học sinh vào lớp từ file Excel
* **Tác nhân thực hiện:** Admin (Import Excel)
* **Mô tả chi tiết:**
  - Admin chọn lớp đích (ví dụ: lớp 10A1), bấm **"Import Học Sinh Từ Excel"**.
  - Tải file mẫu chuẩn (`Danh_Sach_Hoc_Sinh_Template.xlsx`) gồm các cột: `Mã học sinh`, `Họ và tên`, `Email`, `Số điện thoại`.
  - Admin điền dữ liệu và tải file lên hệ thống.
  - Hệ thống kiểm tra trùng lặp email và tính hợp lệ.
  - Tự động tạo hồ sơ học sinh (vai trò mặc định `student`), tự động gán `class_id` vào lớp 10A1.
* **Giao diện trực quan (UI View):** Modal kéo thả file Excel, hiển thị thanh tiến trình nạp dữ liệu và bảng xem trước (preview) danh sách học sinh.

### Bước 4: Phân công Giáo viên bộ môn phụ trách lớp
* **Tác nhân thực hiện:** Admin (Gán giáo viên)
* **Mô tả chi tiết:** Admin chọn lớp và gán giáo viên theo từng môn: ví dụ gán Thầy Nguyễn Văn A phụ trách môn Hóa, Cô Trần Thị B phụ trách môn Sinh.
* **Giao diện trực quan (UI View):** Giao diện phân công trực quan: từng dòng môn học kèm dropdown chọn giáo viên tương ứng.

### Bước 5: Thực hiện Chuyển lớp cho học sinh (Class Transfer)
* **Tác nhân thực hiện:** Admin (Chuyển lớp)
* **Mô tả chi tiết:** Khi học sinh chuyển lớp, Admin chọn học sinh trong danh sách, bấm 'Chuyển lớp' và chọn lớp đích. Hệ thống cập nhật phân lớp mới nhưng vẫn giữ nguyên toàn bộ lịch sử điểm thi của học sinh đó.
* **Giao diện trực quan (UI View):** Hộp thoại xác nhận: 'Chuyển học sinh Lê Văn C từ lớp 10A1 sang lớp 10A2. Lịch sử bài thi sẽ được bảo lưu'.

---

## 3. Quy tắc Nghiệp vụ Cần Ghi nhớ (Business Rules)

* **Bảo lưu toàn vẹn dữ liệu:** Khi chuyển lớp, không xóa hoặc làm thay đổi điểm số các bài thi cũ của học sinh.
* **Chuẩn hóa Import:** File Excel danh sách học sinh phải có định dạng email hợp lệ; các dòng trùng email với tài khoản đã có sẽ được cập nhật lại `class_id` mà không bị tạo trùng tài khoản.
* **Phân quyền dữ liệu của Giáo viên:** Giáo viên chỉ được xem điểm và danh sách học sinh của các lớp mà Admin đã gán phân công theo đúng môn học.
* **Mỗi học sinh tại một thời điểm chỉ thuộc về 1 lớp học chính thức.**
