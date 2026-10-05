# FLOW 10: Bảng Xếp Hạng Top Điểm, Dashboard Đánh Giá Giáo Viên & Báo Cáo

**Độ phức tạp:** Rất phức tạp  
**Tác nhân chính (Actors):** Quản trị viên (Admin)  
**Mục tiêu (Purpose):** Khai thác dữ liệu phân tích sau kỳ thi ở cấp độ toàn trường. Cung cấp bảng xếp hạng thí sinh linh hoạt (Top 10/20/50 hoặc gõ số tùy biến), bộ lọc đa tiêu chí (thời gian làm bài nhanh/chậm, điểm số cao/thấp), dashboard so sánh các lớp theo môn học để đánh giá giáo viên và xuất báo cáo tổng hợp (Excel/PDF).  

---

## 1. Sơ đồ Quy trình (Flowchart)

```mermaid
flowchart TD
    Start([Admin vào mục 'Thống kê & Báo cáo nâng cao']) --> AnalyticsHub{Lựa chọn Công cụ Khai thác}
    
    AnalyticsHub -->|Bảng Xếp Hạng| RankView[Cấu hình Xem Top Thí sinh]
    RankView --> QuickButtons[Chọn nhanh nút: Top 10, Top 20, Top 50]
    RankView --> CustomInput[Hoặc gõ số lượng bất kỳ vào Textbox: VD Top 15, Top 100]
    QuickButtons --> RenderRank[Hiển thị Bảng Xếp hạng Top Điểm Cao Nhất]
    CustomInput --> RenderRank
    
    AnalyticsHub -->|Bộ Lọc & Sắp Xếp| MultiFilter[Mở Bảng Dữ liệu Đa Tiêu Chí]
    MultiFilter --> SortTime[Sắp xếp Thời gian: Sớm nhất <-> Trễ nhất]
    MultiFilter --> SortScore[Sắp xếp Điểm số: Cao xuống thấp <-> Thấp lên cao]
    MultiFilter --> FilterClassSubject[Lọc theo Lớp học & Môn thi]
    SortTime --> FilterResult[Hiển thị danh sách thỏa mãn điều kiện lọc]
    SortScore --> FilterResult
    FilterClassSubject --> FilterResult
    
    AnalyticsHub -->|Dashboard Đánh giá Giáo viên| TeacherEvalDashboard[Xem Dashboard Đánh giá & Giám sát Giáo viên]
    TeacherEvalDashboard --> CompareClasses[Biểu đồ cột so sánh điểm trung bình giữa các lớp theo từng môn]
    CompareClasses --> EvalMetric[Đánh giá mức độ hiệu quả giảng dạy của giáo viên phụ trách]
    
    AnalyticsHub -->|Xuất Báo Cáo Tổng Hợp| MasterExport[Tạo Bảng Tổng Hợp Kết Quả Toàn Trường / Khối Lớp]
    MasterExport --> SelectExportType{Chọn định dạng xuất}
    SelectExportType -->|Excel| ExportAllExcel[Xuất file Excel .xlsx đầy đủ dữ liệu thống kê]
    SelectExportType -->|PDF| ExportAllPDF[Xuất file PDF .pdf báo cáo tổng hợp kết quả kỳ thi]
```

---

## 2. Mô tả Chi tiết Từng bước (Step-by-Step Execution)

### Bước 1: Mở Trung tâm Thống kê & Báo cáo
* **Tác nhân thực hiện:** Admin (Truy cập)
* **Mô tả chi tiết:** Admin truy cập phân hệ Báo cáo. Màn hình chia thành các khu vực: Thống kê nhanh, Bảng xếp hạng Top điểm, Bộ lọc tìm kiếm và Dashboard đánh giá chất lượng giảng dạy.
* **Giao diện trực quan (UI View):** Giao diện Dashboard hiện đại với 4 thẻ tóm tắt (Tổng thí sinh đã thi, Điểm trung bình, Tỷ lệ Đạt, Lớp dẫn đầu).

### Bước 2: Xem Bảng Xếp hạng Top điểm cao
* **Tác nhân thực hiện:** Admin (Xếp hạng)
* **Mô tả chi tiết:** Admin bấm nhanh các nút 'Top 10', 'Top 20', 'Top 50', hoặc gõ một số bất kỳ vào ô Textbox (ví dụ: gõ số '15' để xem Top 15, gõ '100' để xem Top 100) -> Hệ thống trích xuất danh sách dẫn đầu kỳ thi (bao gồm cả các bài tự nộp khi hết giờ).
* **Giao diện trực quan (UI View):** Hàng nút bấm: [Top 10] [Top 20] [Top 50] + Ô nhập liệu 'Nhập số Top...' [Xem]. Huy chương Vàng, Bạc, Đồng ở Top 3.

### Bước 3: Áp dụng Bộ lọc & Sắp xếp đa tiêu chí
* **Tác nhân thực hiện:** Admin (Bộ lọc đa chiều)
* **Mô tả chi tiết:** Admin sử dụng bộ lọc nâng cao: Sắp xếp theo Thời gian hoàn thành (Sớm nhất / Trễ nhất), sắp xếp theo Điểm số (Từ cao xuống thấp hoặc ngược lại), lọc theo Lớp, theo Môn học.
* **Giao diện trực quan (UI View):** Thanh công cụ lọc đa năng: dropdown Môn, dropdown Lớp, toggle sắp xếp Thời gian, toggle sắp xếp Điểm.

### Bước 4: Dashboard So sánh các Lớp & Đánh giá Giáo viên
* **Tác nhân thực hiện:** Admin (Giám sát & Đánh giá)
* **Mô tả chi tiết:** Dashboard hiển thị biểu đồ trực quan so sánh điểm trung bình giữa các lớp theo từng môn học. Admin căn cứ vào đây để đánh giá hiệu quả giảng dạy của giáo viên phụ trách từng bộ môn.
* **Giao diện trực quan (UI View):** Biểu đồ cột so sánh điểm trung bình các lớp theo môn. Bảng xếp hạng chất lượng giảng dạy của giáo viên.

### Bước 5: Xuất Báo cáo Tổng hợp (Excel & PDF)
* **Tác nhân thực hiện:** Admin (Xuất báo cáo)
* **Mô tả chi tiết:** Admin tổng hợp kết quả của một lớp, nhiều lớp hoặc toàn bộ trường. Bấm nút 'Xuất Excel' để nhận bảng tính chi tiết hoặc 'Xuất PDF' để lưu trữ và phục vụ họp chuyên môn.
* **Giao diện trực quan (UI View):** Nút bấm 'Tải Báo cáo Tổng Hợp Excel' và 'Xuất Báo Cáo PDF'. File xuất có đầy đủ chữ ký, biểu đồ và phân tích tỷ lệ xếp loại.

---

## 3. Quy tắc Nghiệp vụ Cần Ghi nhớ (Business Rules)

* **Chuẩn 3 vai trò:** Hệ thống chỉ có 3 vai trò chính thức: Học viên (Student), Giáo viên (Teacher) và Quản trị viên (Admin). Toàn bộ quyền hạn giám sát toàn trường và đánh giá giáo viên thuộc về Quản trị viên (Admin).
* **Bảo toàn dữ liệu thống kê:** Thống kê lớp học và bảng xếp hạng tính toàn bộ kết quả thi thật, không bị mất bài khi thí sinh tự nộp do hết giờ (`timed_out`) hay khi học sinh bấm xóa mềm trên giao diện cá nhân.
* **Kiểm tra nhập liệu:** Ô Textbox nhập số lượng Top phải có cơ chế kiểm tra (Validate): Chỉ cho phép nhập số nguyên dương hợp lệ.
