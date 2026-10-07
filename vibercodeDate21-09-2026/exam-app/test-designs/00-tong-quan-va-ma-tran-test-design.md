# CHIẾN LƯỢC KIỂM THỬ & MA TRẬN TEST DESIGN TOÀN DIỆN (MASTER TEST PLAN)
## HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN - EXAM APP (SUPABASE / POSTGRESQL)

> **Tài liệu tham chiếu:**  
> - 10 Flows Nghiệp Vụ Chuẩn (`exam-app/flows/01-dang-ky-dang-nhap.md` đến `10-bang-xep-hang-dashboard-bao-cao.md`)  
> - Lược đồ CSDL Toàn diện v2.4 (`exam-app/docs/luoc-do-co-so-du-lieu.md` & `DATABASE_DESIGN.md`)  
> - Kiến trúc Bảo Mật Quản Trị 100% Qua RPC (`fn_start_exam`, `fn_save_answer`, `fn_submit_exam_attempt`, `fn_delete_student_attempt`)  
> **Phiên bản Test Design:** 2.4  
> **Ngày phê duyệt:** 2026-10-07  
> **Chuẩn thiết kế:** ISTQB Advanced Test Analyst & OWASP Top 10 API Security  

---

## 1. MỤC TIÊU & PHẠM VI KIỂM THỬ (TEST OBJECTIVES & SCOPE)

### 1.1. Mục tiêu cốt lõi
1. **Kiểm chứng chức năng (Functional Verification):** Đảm bảo toàn bộ 10 luồng nghiệp vụ (Flow 01 -> Flow 10) hoạt động đúng đặc tả, từ xác thực, làm bài, chấm điểm, quản lý lớp, ngân hàng đề đến báo cáo thống kê.
2. **Kiểm chứng bảo mật CSDL & RLS (Security & Anti-Cheat):** Xác minh việc đóng triệt để 4 lỗ hổng bảo mật cốt lõi:
   - **H1 (Chống sửa điểm):** Học sinh không thể tự can thiệp điểm số hay tạo bài thi sẵn điểm 10.
   - **H2 (Chống hack tham số):** Cố định số câu `total_questions` và ngưỡng điểm đạt `pass_score`.
   - **H3 (Chống F12 soi đáp án):** API phòng thi tuyệt đối không trả về `is_correct` và `explanation`.
   - **H4 (Chống gian lận hết giờ):** Cơ chế Server-side timer trên PostgreSQL từ chối lưu đáp án và tự khóa bài thi khi quá thời gian.
3. **Kiểm chứng tính toàn vẹn dữ liệu (Data Integrity):** Bảo toàn bài thi cũ khi chuyển lớp, xóa mềm câu hỏi, và bảo lưu kết quả trên báo cáo giáo viên khi học sinh xóa mềm bài thi cá nhân (`is_student_deleted = true`).

### 1.2. Phân loại mức độ ưu tiên Test Case (Priority)
- **P0 (Blocker / Critical):** Các ca kiểm thử cốt lõi về xác thực, bảo mật RLS, phòng chống gian lận H1-H4, và tính điểm thi.
- **P1 (High):** Các chức năng nghiệp vụ chính: làm bài thi thật/thử, nộp bài, import học sinh/câu hỏi, phân công giáo viên, phê duyệt đề.
- **P2 (Medium):** Các tiện ích giao diện: bộ lọc đa tiêu chí, nút bấm nhanh bảng xếp hạng, chat với AI, định dạng công thức LaTeX, xuất báo cáo Excel/PDF.
- **P3 (Low):** Kiểm tra hiển thị icon, màu sắc thẻ, thông báo phụ, bố cục trang in.

---

## 2. MA TRẬN TRUY XUẤT NGUỒN GỐC (REQUIREMENTS TRACEABILITY MATRIX - RTM)

| Mã Suite | Tên Test Suite | Flow tham chiếu | Bảng CSDL & RPCs liên quan | Lỗ hổng bảo mật kiểm chứng | Tổng số TC | P0 | P1 | P2 |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **TS-01** | Xác thực & Phân quyền Người dùng | Flow 01 | `users`, `classes`, `profiles`, Trigger `trg_fn_auto_create_user_profile` | Chống tự nâng quyền Admin | 8 | 4 | 3 | 1 |
| **TS-02** | Xem Lịch sử Thi & Xóa mềm Cá nhân | Flow 02 | `exam_attempts`, `fn_get_attempt_review`, `fn_delete_student_attempt` | Bảo toàn dữ liệu giáo viên, Bảo mật riêng tư bài thi | 7 | 3 | 3 | 1 |
| **TS-03** | Thi Thử & Chatbot AI Không Áp Lực | Flow 03 | `exam_configs`, `exam_attempts`, `ai_chat_logs`, `fn_start_exam`, `fn_save_answer` | Chống lộ đáp án câu nhiều lựa chọn | 8 | 2 | 4 | 2 |
| **TS-04** | Thi Thật, Auto-Save & Tự Thu Bài | Flow 04 | `exam_attempts`, `exam_attempt_answers`, `fn_start_exam`, `fn_save_answer`, `fn_submit_exam_attempt` | **Triệt tiêu H1, H2, H3, H4** | 12 | 7 | 4 | 1 |
| **TS-05** | Quản lý Kỳ Thi & Cấu hình Đề Thi | Flow 05 | `exam_configs`, `questions`, RLS `exam_configs_manage_admin` | Bảo toàn Snapshot tham số đề thi | 6 | 2 | 3 | 1 |
| **TS-06** | Quản lý Lớp Học & Phân công Giáo viên | Flow 06 | `classes`, `users`, `teacher_classes`, Trigger `trg_fn_prevent_class_change` | Chống học sinh tự nhảy lớp, Chống trùng lặp email | 8 | 3 | 4 | 1 |
| **TS-07** | Phân hệ Giáo viên & Báo cáo Lớp | Flow 07 | `teacher_classes`, `exam_attempts`, `questions` | Cô lập phạm vi dữ liệu giáo viên theo môn/lớp | 7 | 3 | 3 | 1 |
| **TS-08** | Đóng góp & Phê duyệt Câu hỏi 2 cấp | Flow 08 | `questions`, `question_options`, `notifications` | Kiểm soát chất lượng kho đề, Bắt buộc lý do từ chối | 8 | 2 | 5 | 1 |
| **TS-09** | Quản trị Câu hỏi & Import Hàng loạt | Flow 09 | `questions`, `question_options`, `question_import_logs` | Xóa mềm câu hỏi bảo toàn đề cũ, Validation Excel | 9 | 3 | 4 | 2 |
| **TS-10** | Bảng Xếp Hạng & Dashboard Toàn Trường | Flow 10 | `view_leaderboard`, `view_class_performance`, `exam_attempts` | Thống kê tính cả bài `timed_out`, Đánh giá giáo viên | 8 | 2 | 4 | 2 |
| **TS-11** | Chuyên sâu RLS & Thâm nhập CSDL | All / Security | Tất cả 11 bảng, 3 views, 17 RPCs & Functions | **Penetration Test: H1, H2, H3, H4, RLS Bypass** | 10 | 8 | 2 | 0 |
| **TỔNG** | **11 Test Suites Toàn Diện** | **10 Flows** | **11 Bảng, 3 Views, 17 Functions** | **Toàn bộ lỗ hổng bảo mật & toàn vẹn** | **91** | **39** | **39** | **13** |

---

## 3. DANH SÁCH TEST PERSONAS (TÀI KHOẢN THỰC THI KIỂM THỬ)

Để thực hiện kiểm thử chính xác, bộ dữ liệu mẫu (Seed Data) chuẩn bị các tài khoản đại diện:

| Persona ID | Vai trò (Role) | Email / Username | Lớp / Môn phụ trách | Mục đích kiểm thử |
| :--- | :--- | :--- | :--- | :--- |
| `USER_STUDENT_01` | `student` | `hocsinh1@exam.local` | Lớp 10A1 | Học sinh lớp 10A1, làm bài thi thật/thử, xóa mềm bài làm |
| `USER_STUDENT_02` | `student` | `hocsinh2@exam.local` | Lớp 10A1 | Học sinh lớp 10A1, dùng kiểm tra xem trộm bài bạn khác |
| `USER_STUDENT_03` | `student` | `hocsinh3@exam.local` | Lớp 10A2 | Học sinh lớp khác (10A2) dùng kiểm tra cô lập lớp học |
| `USER_TEACHER_CHEM` | `teacher` | `gv.hoa@exam.local` | Phụ trách môn Hóa Lớp 10A1, 10A2 | Kiểm tra quyền giáo viên môn Hóa, xem điểm lớp phụ trách |
| `USER_TEACHER_BIO` | `teacher` | `gv.sinh@exam.local` | Phụ trách môn Sinh Lớp 10A1 | Kiểm tra cô lập dữ liệu giữa giáo viên môn Hóa và Sinh |
| `USER_ADMIN` | `admin` | `admin@exam.local` | Toàn quyền hệ thống | Kiểm tra cấu hình đề, duyệt câu hỏi, xem dashboard toàn trường |
| `USER_ANONYMOUS` | `unauthenticated` | Không đăng nhập | Khách vãng lai | Kiểm tra chặn truy cập trái phép không có JWT Token |

---

## 4. QUY ƯỚC ĐẶT TÊN TEST CASE
Mỗi ca kiểm thử tuân theo quy tắc:
`TC-[MÃ_PHÂN_HỆ]-[SỐ_THỨ_TỰ]`
- `TC-AUTH-xx`: Xác thực và phân quyền (Flow 01)
- `TC-HIST-xx`: Lịch sử thi và xóa mềm (Flow 02)
- `TC-PRAC-xx`: Thi thử và AI Chatbot (Flow 03)
- `TC-REAL-xx`: Thi thật, auto-save và nộp bài (Flow 04)
- `TC-CONF-xx`: Cấu hình kỳ thi (Flow 05)
- `TC-CLAS-xx`: Quản lý lớp học và phân công (Flow 06)
- `TC-TEAC-xx`: Phân hệ giáo viên và báo cáo (Flow 07)
- `TC-QUES-xx`: Đóng góp và phê duyệt câu hỏi (Flow 08)
- `TC-IMPT-xx`: Ngân hàng câu hỏi và import Excel (Flow 09)
- `TC-DASH-xx`: Bảng xếp hạng và dashboard (Flow 10)
- `TC-SECU-xx`: Chuyên sâu bảo mật RLS và H1-H4 (Bảo mật CSDL)
