-- ============================================================================
-- EXAM APP - SEED DATA (02_seed.sql)
-- Dữ liệu khởi tạo: Lớp học, Cấu hình đề thi, Ngân hàng câu hỏi (LaTeX & Đa đáp án đúng)
-- Cho 3 môn: Hóa học, Sinh học, Tiếng Anh
-- Chuẩn hóa question_type: single_choice và multiple_choice
-- ============================================================================

-- 1. KHỞI TẠO DANH SÁCH LỚP HỌC (CLASSES)
INSERT INTO public.classes (id, code, name, grade, school_year, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', '10A1', 'Lớp 10A1 - Chuyên Tự Nhiên', '10', '2026-2027', true),
('c0000000-0000-0000-0000-000000000002', '11B2', 'Lớp 11B2 - Ban Nâng Cao', '11', '2026-2027', true),
('c0000000-0000-0000-0000-000000000003', '12A1', 'Lớp 12A1 - Luyện Thi Đại Học', '12', '2026-2027', true)
ON CONFLICT (code) DO NOTHING;

-- 2. KHỞI TẠO CẤU HÌNH ĐỀ THI MẶC ĐỊNH (EXAM_CONFIGS) - THEO KỲ THI & MÔN
INSERT INTO public.exam_configs (id, title, exam_type, academic_term, subject, duration_minutes, total_questions, pass_score, shuffle_questions, shuffle_options, is_active) VALUES
('e0000000-0000-0000-0000-000000000001', 'Đề kiểm tra giữa kỳ 1 - Hóa học 45 phút', 'mid_term', 'Học kỳ 1', 'chemistry', 45, 20, 5.00, true, true, true),
('e0000000-0000-0000-0000-000000000002', 'Đề kiểm tra giữa kỳ 1 - Sinh học 45 phút', 'mid_term', 'Học kỳ 1', 'biology', 45, 20, 5.00, true, true, true),
('e0000000-0000-0000-0000-000000000003', 'Đề kiểm tra giữa kỳ 1 - Tiếng Anh 45 phút', 'mid_term', 'Học kỳ 1', 'english', 45, 20, 5.00, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. KHỞI TẠO NGÂN HÀNG CÂU HỎI MẪU (HÓA HỌC, SINH HỌC, TIẾNG ANH)
-- ============================================================================

-- 3.1. MÔN HÓA HỌC (CHEMISTRY)
-- Câu 1: Phản ứng oxi hóa khử (Đơn đáp án đúng: single_choice)
INSERT INTO public.questions (id, subject, question_type, content, explanation, difficulty, status, is_active) VALUES
('q1000000-0000-0000-0000-000000000001', 'chemistry', 'single_choice',
'Cho phản ứng hóa học sau: $\ce{Fe + 2HCl -> FeCl2 + H2 ^}$. Trong phản ứng này, nguyên tố sắt ($\ce{Fe}$) đóng vai trò gì?',
'Sắt ($\ce{Fe}$) có số oxi hóa tăng từ $0$ lên $+2$ ($\ce{Fe^0 -> Fe^{+2} + 2e}$), do đó sắt là chất khử (chất cho electron).',
'easy', 'approved', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_key, content, is_correct, sort_order) VALUES
('q1000000-0000-0000-0000-000000000001', 'A', 'Chất khử (chất cho electron)', true, 1),
('q1000000-0000-0000-0000-000000000001', 'B', 'Chất oxi hóa (chất nhận electron)', false, 2),
('q1000000-0000-0000-0000-000000000001', 'C', 'Chất môi trường trung tính', false, 3),
('q1000000-0000-0000-0000-000000000001', 'D', 'Chất xúc tác phản ứng', false, 4)
ON CONFLICT (question_id, option_key) DO NOTHING;

-- Câu 2: Hóa hữu cơ (Đa đáp án đúng: multiple_choice)
INSERT INTO public.questions (id, subject, question_type, content, explanation, difficulty, status, is_active) VALUES
('q1000000-0000-0000-0000-000000000002', 'chemistry', 'multiple_choice',
'Những chất nào sau đây tác dụng được với dung dịch kiềm $\ce{NaOH}$ khi đun nóng? (Chọn tất cả các đáp án đúng)',
'Các chất tác dụng được với $\ce{NaOH}$ gồm: Axit ($\ce{HCl}$), Oxit lưỡng tính ($\ce{Al2O3}$), Oxit axit ($\ce{CO2}$) và Este ($\ce{CH3COOC2H5}$). Riêng $\ce{Fe(OH)2}$ là bazơ không tan, không phản ứng với kiềm $\ce{NaOH}$.',
'medium', 'approved', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_key, content, is_correct, sort_order) VALUES
('q1000000-0000-0000-0000-000000000002', 'A', 'Nhôm oxit ($\ce{Al2O3}$)', true, 1),
('q1000000-0000-0000-0000-000000000002', 'B', 'Axit clohiđric ($\ce{HCl}$)', true, 2),
('q1000000-0000-0000-0000-000000000002', 'C', 'Sắt(II) hiđroxit ($\ce{Fe(OH)2}$)', false, 3),
('q1000000-0000-0000-0000-000000000002', 'D', 'Khí cacbonic ($\ce{CO2}$)', true, 4),
('q1000000-0000-0000-0000-000000000002', 'E', 'Etyl axetat ($\ce{CH3COOC2H5}$)', true, 5)
ON CONFLICT (question_id, option_key) DO NOTHING;

-- Câu 3: Thụ động hóa kim loại (Đơn đáp án đúng: single_choice)
INSERT INTO public.questions (id, subject, question_type, content, explanation, difficulty, status, is_active) VALUES
('q1000000-0000-0000-0000-000000000003', 'chemistry', 'single_choice',
'Dung dịch axit sunfuric đặc, nguội ($\ce{H2SO4}$ đặc nguội) thụ động hóa với nhóm kim loại nào dưới đây?',
'Ở nhiệt độ thường, $\ce{H2SO4}$ đặc nguội và $\ce{HNO3}$ đặc nguội làm thụ động hóa các kim loại $\ce{Al}$, $\ce{Fe}$ và $\ce{Cr}$ do tạo màng oxit bền bảo vệ bề mặt.',
'easy', 'approved', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_key, content, is_correct, sort_order) VALUES
('q1000000-0000-0000-0000-000000000003', 'A', '$\ce{Al}$, $\ce{Fe}$, $\ce{Cr}$', true, 1),
('q1000000-0000-0000-0000-000000000003', 'B', '$\ce{Cu}$, $\ce{Ag}$, $\ce{Au}$', false, 2),
('q1000000-0000-0000-0000-000000000003', 'C', '$\ce{Zn}$, $\ce{Mg}$, $\ce{Sn}$', false, 3),
('q1000000-0000-0000-0000-000000000003', 'D', '$\ce{Na}$, $\ce{K}$, $\ce{Ba}$', false, 4)
ON CONFLICT (question_id, option_key) DO NOTHING;

-- 3.2. MÔN SINH HỌC (BIOLOGY)
-- Câu 4: Quang hợp ở thực vật (Đơn đáp án đúng: single_choice)
INSERT INTO public.questions (id, subject, question_type, content, explanation, difficulty, status, is_active) VALUES
('q2000000-0000-0000-0000-000000000001', 'biology', 'single_choice',
'Phương trình tổng quát biểu diễn quá trình quang hợp ở thực vật có màu xanh là:',
'Quang hợp là quá trình sử dụng năng lượng ánh sáng mặt trời do diệp lục hấp thụ để tổng hợp chất hữu cơ (glucose) và giải phóng oxy từ $\text{CO}_2$ và $\text{H}_2\text{O}$ theo phương trình: $6\text{CO}_2 + 6\text{H}_2\text{O} \xrightarrow{\text{ánh sáng, diệp lục}} \text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2$.',
'easy', 'approved', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_key, content, is_correct, sort_order) VALUES
('q2000000-0000-0000-0000-000000000001', 'A', '$6\text{CO}_2 + 6\text{H}_2\text{O} \xrightarrow{\text{ánh sáng, diệp lục}} \text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2$', true, 1),
('q2000000-0000-0000-0000-000000000001', 'B', '$\text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2 \rightarrow 6\text{CO}_2 + 6\text{H}_2\text{O} + \text{ATP}$', false, 2),
('q2000000-0000-0000-0000-000000000001', 'C', '$6\text{CO}_2 + 12\text{H}_2\text{O} \rightarrow \text{C}_6\text{H}_{12}\text{O}_6 + 6\text{H}_2\text{O} + 6\text{O}_2$', false, 3),
('q2000000-0000-0000-0000-000000000001', 'D', '$\text{C}_2\text{H}_5\text{OH} + \text{O}_2 \rightarrow \text{CH}_3\text{COOH} + \text{H}_2\text{O}$', false, 4)
ON CONFLICT (question_id, option_key) DO NOTHING;

-- Câu 5: Cấu trúc ADN (Đa đáp án đúng: multiple_choice)
INSERT INTO public.questions (id, subject, question_type, content, explanation, difficulty, status, is_active) VALUES
('q2000000-0000-0000-0000-000000000002', 'biology', 'multiple_choice',
'Những loại nucleotide nào sau đây tham gia trực tiếp cấu tạo nên phân tử ADN? (Chọn tất cả các đáp án đúng)',
'Phân tử ADN được cấu tạo từ 4 loại nucleotide: A (Adenine), T (Thymine), G (Guanine) và C (Cytosine). Nucleotide loại U (Uracil) chỉ tham gia cấu tạo nên phân tử ARN.',
'medium', 'approved', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_key, content, is_correct, sort_order) VALUES
('q2000000-0000-0000-0000-000000000002', 'A', 'Adenine (A)', true, 1),
('q2000000-0000-0000-0000-000000000002', 'B', 'Uracil (U)', false, 2),
('q2000000-0000-0000-0000-000000000002', 'C', 'Thymine (T)', true, 3),
('q2000000-0000-0000-0000-000000000002', 'D', 'Guanine (G)', true, 4),
('q2000000-0000-0000-0000-000000000002', 'E', 'Cytosine (C)', true, 5)
ON CONFLICT (question_id, option_key) DO NOTHING;

-- 3.3. MÔN TIẾNG ANH (ENGLISH)
-- Câu 6: Câu điều kiện hỗn hợp (Đơn đáp án đúng: single_choice)
INSERT INTO public.questions (id, subject, question_type, content, explanation, difficulty, status, is_active) VALUES
('q3000000-0000-0000-0000-000000000001', 'english', 'single_choice',
'If she ________ harder before the examination, she would have passed with flying colors.',
'Đây là câu điều kiện loại 3 diễn tả sự việc trái ngược với thực tế trong quá khứ: If + S + had + P2 (past perfect), S + would/could + have + P2.',
'medium', 'approved', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_key, content, is_correct, sort_order) VALUES
('q3000000-0000-0000-0000-000000000001', 'A', 'had studied', true, 1),
('q3000000-0000-0000-0000-000000000001', 'B', 'studied', false, 2),
('q3000000-0000-0000-0000-000000000001', 'C', 'has studied', false, 3),
('q3000000-0000-0000-0000-000000000001', 'D', 'would study', false, 4)
ON CONFLICT (question_id, option_key) DO NOTHING;

-- Câu 7: Từ đồng nghĩa (Đa đáp án đúng: multiple_choice)
INSERT INTO public.questions (id, subject, question_type, content, explanation, difficulty, status, is_active) VALUES
('q3000000-0000-0000-0000-000000000002', 'english', 'multiple_choice',
'Which of the following words are synonyms or close in meaning to the adjective "innovative"? (Select all that apply)',
'"Innovative" có nghĩa là mang tính đổi mới, sáng tạo. Các từ đồng nghĩa gồm: "Creative" (sáng tạo), "Groundbreaking" (đột phá) và "Inventive" (phát minh/sáng tạo). "Conventional" (truyền thống/cũ kỹ) và "Outdated" (lỗi thời) mang nghĩa trái ngược.',
'hard', 'approved', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_key, content, is_correct, sort_order) VALUES
('q3000000-0000-0000-0000-000000000002', 'A', 'Creative', true, 1),
('q3000000-0000-0000-0000-000000000002', 'B', 'Conventional', false, 2),
('q3000000-0000-0000-0000-000000000002', 'C', 'Groundbreaking', true, 3),
('q3000000-0000-0000-0000-000000000002', 'D', 'Outdated', false, 4),
('q3000000-0000-0000-0000-000000000002', 'E', 'Inventive', true, 5)
ON CONFLICT (question_id, option_key) DO NOTHING;
