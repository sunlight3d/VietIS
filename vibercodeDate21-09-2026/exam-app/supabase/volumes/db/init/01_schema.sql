-- ============================================================================
-- EXAM APP - SUPABASE DATABASE SCHEMA (01_schema.sql)
-- Chuẩn hóa danh pháp Tiếng Anh theo convention: users(username, hash_password)
-- Khắc phục toàn diện 8 lỗ hổng bảo mật & hoàn thiện đầy đủ tính năng nghiệp vụ:
-- 1. Chống tự nâng quyền khi đăng ký (Strict Student role default)
-- 2. Chống lộ đáp án qua F12 / API (Tách biệt quyền truy cập is_correct & RPC bảo mật)
-- 3. Chống học sinh tự sửa điểm / chèn điểm 10 (Trigger khóa điểm + chỉ cho phép Stored Procedure chấm)
-- 4. Chống lộ hash_password & email qua View (View profiles có security_invoker và ẩn hash_password)
-- 5. Bảo toàn bài thi tự nộp khi hết giờ (timed_out) trong Bảng xếp hạng & Thống kê
-- 6. Bảo toàn dữ liệu báo cáo khi học sinh xóa mềm (Teacher & Admin luôn thấy toàn bộ điểm số thật)
-- 7. Bảo toàn lịch sử bài làm khi xóa câu hỏi (ON DELETE RESTRICT + Snapshot câu hỏi)
-- 8. Chấm điểm chuẩn xác theo tổng số câu của đề thi (Bỏ trống câu bị tính 0 điểm)
-- Bổ sung: Phân quyền giáo viên theo môn, Bảng thông báo, Cột loại câu hỏi, Snapshot cấu hình đề,
-- và Cho phép giáo viên sửa lại câu hỏi bị từ chối (resubmit rejected question).
-- ============================================================================

-- 1. BẬT CÁC EXTENSION CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TẠO CÁC KIỂU ENUM DỮ LIỆU ĐẶC THÙ
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE subject_type AS ENUM ('chemistry', 'biology', 'english');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE exam_mode AS ENUM ('practice', 'real');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE exam_status AS ENUM ('in_progress', 'completed', 'timed_out', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE question_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE academic_rank AS ENUM ('xuat_sac', 'gioi', 'kha', 'trung_binh', 'yeu');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('single_choice', 'multiple_choice');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('question_approved', 'question_rejected', 'exam_submitted', 'class_assigned', 'system_alert');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- 3. ĐỊNH NGHĨA CÁC BẢNG DỮ LIỆU (TABLES)
-- ============================================================================

-- 3.1. BẢNG LỚP HỌC (CLASSES) - Flow 06
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- Ví dụ: 10A1, 11B2, 12A1
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL CHECK (grade IN ('10', '11', '12', 'other')),
    school_year VARCHAR(20) NOT NULL DEFAULT '2026-2027',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2. BẢNG NGƯỜI DÙNG (USERS) - Convention chuẩn: users(username, hash_password) (Flow 01)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Khớp với auth.users.id nếu dùng Supabase Auth
    username VARCHAR(100) UNIQUE, -- Tên đăng nhập
    email VARCHAR(255) UNIQUE NOT NULL, -- Email đăng nhập
    hash_password VARCHAR(255), -- Mật khẩu đã băm (Bcrypt / Argon2)
    full_name VARCHAR(255) NOT NULL, -- Họ và tên hiển thị
    role user_role NOT NULL DEFAULT 'student', -- Mặc định luôn là student, không thể tự nâng quyền
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL, -- Học sinh thuộc 1 lớp học
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- VIEW PROFILES (Tương thích ngược & BẢO MẬT: Bật security_invoker và ẩn hash_password)
CREATE OR REPLACE VIEW public.profiles 
WITH (security_invoker = true) AS 
SELECT 
    id, 
    username, 
    email, 
    full_name, 
    role, 
    class_id, 
    avatar_url, 
    phone, 
    is_active, 
    created_at, 
    updated_at 
FROM public.users;

-- 3.3. BẢNG PHÂN CÔNG GIÁO VIÊN THEO LỚP & MÔN HỌC (TEACHER_CLASSES) - Flow 06 & 07
CREATE TABLE IF NOT EXISTS public.teacher_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject subject_type NOT NULL, -- Giáo viên bị giới hạn đúng môn học phụ trách
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(teacher_id, class_id, subject)
);

-- 3.4. BẢNG CẤU HÌNH ĐỀ THI THEO KỲ THI & MÔN (EXAM_CONFIGS) - Flow 05
CREATE TABLE IF NOT EXISTS public.exam_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL, -- Tên kỳ thi / bài thi (VD: 'Kiểm tra 15 phút - Sinh học 10')
    exam_type VARCHAR(50) NOT NULL DEFAULT 'regular_test', -- '15_min', '45_min', 'mid_term', 'final_term', 'practice'
    academic_term VARCHAR(50) NOT NULL DEFAULT 'Học kỳ 1',
    subject subject_type NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
    total_questions INT NOT NULL DEFAULT 20 CHECK (total_questions > 0),
    pass_score NUMERIC(4,2) NOT NULL DEFAULT 5.00 CHECK (pass_score >= 0 AND pass_score <= 10),
    start_time TIMESTAMPTZ, -- Thời điểm mở đề thi
    end_time TIMESTAMPTZ, -- Thời điểm kết thúc kỳ thi
    shuffle_questions BOOLEAN NOT NULL DEFAULT true,
    shuffle_options BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.5. BẢNG NGÂN HÀNG CÂU HỎI (QUESTIONS) - Flow 08 & 09
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject subject_type NOT NULL,
    question_type question_type NOT NULL DEFAULT 'multiple_choice', -- 'single_choice' (1 đáp án) hoặc 'multiple_choice' (nhiều đáp án)
    content TEXT NOT NULL, -- Hỗ trợ công thức Toán, Lý, Hóa (LaTeX) & tiếng Việt
    image_url TEXT,
    explanation TEXT, -- Lời giải thích chi tiết (hỗ trợ LaTeX)
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status question_status NOT NULL DEFAULT 'approved', -- 'pending' (chờ duyệt), 'approved', 'rejected'
    rejection_reason TEXT,
    contributed_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Giáo viên đề xuất
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Admin phê duyệt
    reviewed_at TIMESTAMPTZ,
    is_deleted BOOLEAN NOT NULL DEFAULT false, -- XÓA MỀM CÂU HỎI: Bảo toàn lịch sử các bài thi cũ
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.6. BẢNG ĐÁP ÁN LỰA CHỌN (QUESTION_OPTIONS) - Hỗ trợ nhiều đáp án đúng (Flow 03, 04, 09)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_key VARCHAR(5) NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
    content TEXT NOT NULL, -- Hỗ trợ LaTeX
    is_correct BOOLEAN NOT NULL DEFAULT false, -- Ẩn khỏi học sinh để chống F12
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(question_id, option_key)
);

-- 3.7. BẢNG LƯỢT THI / BÀI LÀM (EXAM_ATTEMPTS) - Flow 02, 03, 04, 10
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    exam_config_id UUID REFERENCES public.exam_configs(id) ON DELETE SET NULL,
    exam_title VARCHAR(255) NOT NULL, -- Snapshot tiêu đề kỳ thi tại thời điểm làm bài
    subject subject_type NOT NULL,
    mode exam_mode NOT NULL DEFAULT 'real', -- 'practice' (thi thử) | 'real' (thi thật)
    status exam_status NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    auto_submitted BOOLEAN NOT NULL DEFAULT false, -- true nếu hết giờ tự động nộp bài
    duration_minutes INT NOT NULL DEFAULT 45, -- Snapshot thời lượng thi
    pass_score NUMERIC(4,2) NOT NULL DEFAULT 5.00, -- Snapshot điểm đạt
    total_questions INT NOT NULL DEFAULT 20, -- Tổng số câu cố định của đề thi (không phụ thuộc số câu đã tích)
    correct_answers_count INT NOT NULL DEFAULT 0,
    score NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (score >= 0 AND score <= 10), -- Thang điểm 10
    is_passed BOOLEAN NOT NULL DEFAULT false, -- Điểm đạt (giao diện xanh / đỏ)
    academic_rank academic_rank, -- Xuất sắc, Giỏi, Khá, Trung bình, Yếu
    is_student_deleted BOOLEAN NOT NULL DEFAULT false, -- XÓA MỀM PHÍA HỌC SINH (Chỉ ẩn ở màn hình cá nhân, BẢO TOÀN ở báo cáo của GV & Admin)
    config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb, -- Toàn bộ snapshot cấu hình đề thi tại thời điểm thi
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.8. BẢNG CHI TIẾT CÂU TRẢ LỜI CỦA THÍ SINH (EXAM_ATTEMPT_ANSWERS) - Flow 03 & 04
CREATE TABLE IF NOT EXISTS public.exam_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT, -- KHÔNG XÓA CASCADE: Bảo toàn bài thi lịch sử khi xóa câu hỏi
    selected_option_ids UUID[] NOT NULL DEFAULT '{}', -- Danh sách ID đáp án được chọn (multi-select)
    is_correct BOOLEAN NOT NULL DEFAULT false,
    points_awarded NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    question_snapshot_content TEXT, -- Snapshot nội dung câu hỏi lúc làm bài
    options_snapshot JSONB, -- Snapshot danh sách đáp án lúc làm bài
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(attempt_id, question_id)
);

-- 3.9. BẢNG NHẬT KÝ CHATBOT AI HỖ TRỢ THI THỬ (AI_CHAT_LOGS) - Flow 03
CREATE TABLE IF NOT EXISTS public.ai_chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
    student_prompt TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.10. BẢNG NHẬT KÝ IMPORT CÂU HỎI TỪ EXCEL (QUESTION_IMPORT_LOGS) - Flow 09
CREATE TABLE IF NOT EXISTS public.question_import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imported_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    total_rows INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    error_count INT NOT NULL DEFAULT 0,
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.11. BẢNG THÔNG BÁO CHO GIÁO VIÊN & HỆ THỐNG (NOTIFICATIONS)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'system_alert',
    is_read BOOLEAN NOT NULL DEFAULT false,
    reference_id UUID,
    reference_type VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. TẠO INDEXES TỐI ƯU HÓA HIỆU NĂNG TRUY VẤN
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_class_id ON public.users(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_lookup ON public.teacher_classes(teacher_id, class_id, subject);
CREATE INDEX IF NOT EXISTS idx_questions_subject_status ON public.questions(subject, status) WHERE is_active = true AND is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(question_type);
CREATE INDEX IF NOT EXISTS idx_question_options_qid ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_active ON public.exam_attempts(user_id, is_student_deleted);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_class_subject ON public.exam_attempts(class_id, subject, status);
CREATE INDEX IF NOT EXISTS idx_exam_attempt_answers_attempt ON public.exam_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- ============================================================================
-- 5. TRIGGERS & STORED PROCEDURES (BẢO MẬT & TÍNH ĐIỂM)
-- ============================================================================

-- 5.1. Trigger cập nhật updated_at tự động
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_exam_configs_updated_at
    BEFORE UPDATE ON public.exam_configs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_exam_attempts_updated_at
    BEFORE UPDATE ON public.exam_attempts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5.2. Trigger tạo hồ sơ user khi đăng ký qua Auth
-- BẢO MẬT: BẮT BUỘC gán role = 'student', triệt tiêu hoàn toàn nguy cơ tự gán 'admin' khi đăng ký!
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_class_id UUID := NULL;
    v_full_name TEXT := '';
    v_username TEXT := NULL;
BEGIN
    -- Trích xuất class_id nếu học sinh tự chọn lớp khi đăng ký
    IF NEW.raw_user_meta_data->>'class_id' IS NOT NULL THEN
        BEGIN
            v_class_id := (NEW.raw_user_meta_data->>'class_id')::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_class_id := NULL;
        END;
    END IF;

    -- Tên đăng nhập username
    v_username := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'username', ''),
        split_part(NEW.email, '@', 1)
    );

    -- Họ và tên
    v_full_name := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'name', ''),
        split_part(NEW.email, '@', 1)
    );

    -- BẢO MẬT TUYỆT ĐỐI: Người dùng đăng ký MẶC ĐỊNH LUÔN LÀ 'student'.
    -- Quyền 'teacher' và 'admin' chỉ có thể do Admin nâng cấp trong hệ thống quản trị!
    INSERT INTO public.users (id, username, email, full_name, role, class_id, avatar_url)
    VALUES (
        NEW.id,
        v_username,
        NEW.email,
        v_full_name,
        'student',
        v_class_id,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5.3. Trigger bảo vệ điểm số bài thi (Chống học sinh tự sửa điểm / tạo điểm 10 qua API)
CREATE OR REPLACE FUNCTION public.trg_fn_protect_exam_attempt()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu không phải admin, ngăn chặn can thiệp điểm số và trạng thái hoàn thành trực tiếp
    IF NOT public.is_admin() THEN
        IF TG_OP = 'INSERT' THEN
            NEW.score := 0.00;
            NEW.is_passed := false;
            NEW.correct_answers_count := 0;
            NEW.status := 'in_progress';
            NEW.academic_rank := NULL;
            NEW.submitted_at := NULL;
            NEW.auto_submitted := false;
            NEW.is_student_deleted := false;
        ELSIF TG_OP = 'UPDATE' THEN
            -- Học viên chỉ được phép cập nhật is_student_deleted (xóa mềm cá nhân)
            -- Mọi thay đổi điểm số, số câu đúng, trạng thái nộp bài PHẢI thông qua fn_submit_exam_attempt (SECURITY DEFINER)
            IF NEW.score <> OLD.score OR NEW.is_passed <> OLD.is_passed 
               OR NEW.correct_answers_count <> OLD.correct_answers_count 
               OR (NEW.status IN ('completed', 'timed_out') AND OLD.status = 'in_progress') THEN
                IF current_setting('exam.is_submitting', true) IS DISTINCT FROM 'true' THEN
                    RAISE EXCEPTION 'Bảo mật: Không được phép tự sửa đổi điểm số hoặc trạng thái bài thi trực tiếp!';
                END IF;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_protect_exam_attempt_grades
    BEFORE INSERT OR UPDATE ON public.exam_attempts
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_protect_exam_attempt();

-- 5.4. Trigger cho phép giáo viên cập nhật câu hỏi bị từ chối (Chuyển rejected -> pending)
CREATE OR REPLACE FUNCTION public.fn_handle_question_teacher_resubmit()
RETURNS TRIGGER AS $$
BEGIN
    IF public.is_teacher() AND NOT public.is_admin() THEN
        -- Khi giáo viên cập nhật câu hỏi (kể cả câu bị rejected), tự động đưa về 'pending' chờ duyệt lại
        NEW.status := 'pending';
        NEW.reviewed_by := NULL;
        NEW.reviewed_at := NULL;
        NEW.rejection_reason := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_question_teacher_resubmit
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.fn_handle_question_teacher_resubmit();

-- 5.5. Trigger gửi thông báo khi Admin phê duyệt hoặc từ chối câu hỏi của Giáo viên
CREATE OR REPLACE FUNCTION public.fn_notify_question_review()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') AND NEW.contributed_by IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, content, type, reference_id, reference_type)
        VALUES (
            NEW.contributed_by,
            CASE WHEN NEW.status = 'approved' THEN 'Câu hỏi của bạn đã được phê duyệt' ELSE 'Câu hỏi bị từ chối phê duyệt' END,
            CASE WHEN NEW.status = 'approved' 
                 THEN 'Câu hỏi môn ' || NEW.subject::text || ' bạn đóng góp đã được Admin phê duyệt vào ngân hàng đề.'
                 ELSE 'Câu hỏi môn ' || NEW.subject::text || ' bị từ chối. Lý do: ' || COALESCE(NEW.rejection_reason, 'Không đạt yêu cầu chuyên môn.')
            END,
            CASE WHEN NEW.status = 'approved' THEN 'question_approved'::public.notification_type ELSE 'question_rejected'::public.notification_type END,
            NEW.id,
            'question'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_notify_question_review
    AFTER UPDATE OF status ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.fn_notify_question_review();

-- 5.6. Hàm xác định xếp loại học lực chuẩn theo thang điểm 10
CREATE OR REPLACE FUNCTION public.fn_get_academic_rank(p_score NUMERIC)
RETURNS public.academic_rank AS $$
BEGIN
    IF p_score >= 9.0 THEN
        RETURN 'xuat_sac';
    ELSIF p_score >= 8.0 THEN
        RETURN 'gioi';
    ELSIF p_score >= 6.5 THEN
        RETURN 'kha';
    ELSIF p_score >= 5.0 THEN
        RETURN 'trung_binh';
    ELSE
        RETURN 'yeu';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5.7. Hàm nộp bài & chấm điểm bài thi tự động (Flow 04)
-- BẢO MẬT & CHÍNH XÁC:
-- - Chấm trên tổng số câu thực tế của đề thi (Bỏ trống câu = 0 điểm)
-- - Set config để bypass trigger bảo vệ điểm số
CREATE OR REPLACE FUNCTION public.fn_submit_exam_attempt(
    p_attempt_id UUID,
    p_auto_submitted BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
    v_attempt RECORD;
    v_total_questions INT;
    v_correct_count INT := 0;
    v_score NUMERIC(4,2) := 0.00;
    v_pass_score NUMERIC(4,2) := 5.00;
    v_is_passed BOOLEAN := false;
    v_rank public.academic_rank;
    r_ans RECORD;
    v_correct_opt_ids UUID[];
BEGIN
    -- Lấy thông tin bài thi
    SELECT * INTO v_attempt FROM public.exam_attempts WHERE id = p_attempt_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy lượt thi với ID %', p_attempt_id;
    END IF;

    -- Kiểm tra quyền: Chỉ học sinh sở hữu bài thi hoặc Admin mới được nộp
    IF v_attempt.user_id <> auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Bạn không có quyền nộp bài thi này!';
    END IF;

    -- Lấy pass_score và total_questions từ snapshot hoặc exam_configs
    v_pass_score := COALESCE(v_attempt.pass_score, 5.00);
    v_total_questions := COALESCE(v_attempt.total_questions, 20);
    IF v_total_questions <= 0 AND v_attempt.exam_config_id IS NOT NULL THEN
        SELECT total_questions, pass_score INTO v_total_questions, v_pass_score 
        FROM public.exam_configs WHERE id = v_attempt.exam_config_id;
    END IF;
    v_total_questions := GREATEST(COALESCE(v_total_questions, 20), 1);

    -- Duyệt qua tất cả câu trả lời của attempt để chấm điểm
    FOR r_ans IN 
        SELECT a.id, a.question_id, a.selected_option_ids
        FROM public.exam_attempt_answers a
        WHERE a.attempt_id = p_attempt_id
    LOOP
        -- Lấy danh sách ID các đáp án đúng của câu hỏi
        SELECT ARRAY_AGG(id ORDER BY id) INTO v_correct_opt_ids
        FROM public.question_options
        WHERE question_id = r_ans.question_id AND is_correct = true;

        -- So khớp đáp án của thí sinh (Multi-choice khớp 100% mới tính điểm)
        IF (SELECT ARRAY_AGG(x ORDER BY x) FROM UNNEST(r_ans.selected_option_ids) x) = v_correct_opt_ids THEN
            UPDATE public.exam_attempt_answers 
            SET is_correct = true, points_awarded = 1.00
            WHERE id = r_ans.id;
            v_correct_count := v_correct_count + 1;
        ELSE
            UPDATE public.exam_attempt_answers 
            SET is_correct = false, points_awarded = 0.00
            WHERE id = r_ans.id;
        END IF;
    END LOOP;

    -- CHẤM ĐIỂM CHUẨN XÁC: (Số câu đúng / Tổng số câu đề thi) * 10
    -- Câu bỏ trống không nằm trong exam_attempt_answers nên không được tính vào v_correct_count
    v_score := ROUND((v_correct_count::numeric / v_total_questions::numeric) * 10.0, 2);
    v_is_passed := (v_score >= v_pass_score);
    v_rank := public.fn_get_academic_rank(v_score);

    -- BẬT CỜ BẢO MẬT: Cho phép cập nhật điểm thông qua trigger bảo vệ
    PERFORM set_config('exam.is_submitting', 'true', true);

    -- Cập nhật vào exam_attempts
    UPDATE public.exam_attempts
    SET status = CASE WHEN p_auto_submitted THEN 'timed_out'::public.exam_status ELSE 'completed'::public.exam_status END,
        auto_submitted = p_auto_submitted,
        submitted_at = now(),
        correct_answers_count = v_correct_count,
        total_questions = v_total_questions,
        score = v_score,
        is_passed = v_is_passed,
        academic_rank = v_rank
    WHERE id = p_attempt_id;

    -- Gửi thông báo cho Giáo viên phụ trách lớp khi học sinh nộp bài thi thật
    IF v_attempt.mode = 'real' AND v_attempt.class_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, content, type, reference_id, reference_type)
        SELECT 
            tc.teacher_id,
            'Học sinh vừa nộp bài thi',
            'Học sinh thuộc lớp đã hoàn thành bài thi ' || v_attempt.subject::text || ' với điểm số ' || v_score::text || '/10.',
            'exam_submitted'::public.notification_type,
            p_attempt_id,
            'exam_attempt'
        FROM public.teacher_classes tc
        WHERE tc.class_id = v_attempt.class_id AND tc.subject = v_attempt.subject;
    END IF;

    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'status', CASE WHEN p_auto_submitted THEN 'timed_out' ELSE 'completed' END,
        'score', v_score,
        'correct_count', v_correct_count,
        'total_questions', v_total_questions,
        'is_passed', v_is_passed,
        'academic_rank', v_rank,
        'auto_submitted', p_auto_submitted
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.8. Hàm lấy đề thi cho học sinh (CHỐNG F12: Ẩn hoàn toàn is_correct và explanation)
CREATE OR REPLACE FUNCTION public.fn_get_exam_questions(p_attempt_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_attempt RECORD;
    v_questions JSONB;
BEGIN
    SELECT * INTO v_attempt FROM public.exam_attempts WHERE id = p_attempt_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy lượt thi!';
    END IF;

    IF v_attempt.user_id <> auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Không có quyền truy cập lượt thi này!';
    END IF;

    -- Trích xuất danh sách câu hỏi và các đáp án KHÔNG CHỨA cột is_correct
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', q.id,
            'subject', q.subject,
            'question_type', q.question_type,
            'content', q.content,
            'image_url', q.image_url,
            'difficulty', q.difficulty,
            'options', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', qo.id,
                        'option_key', qo.option_key,
                        'content', qo.content,
                        'sort_order', qo.sort_order
                    ) ORDER BY qo.sort_order
                )
                FROM public.question_options qo
                WHERE qo.question_id = q.id
            )
        )
    ) INTO v_questions
    FROM public.exam_attempt_answers ea
    JOIN public.questions q ON ea.question_id = q.id
    WHERE ea.attempt_id = p_attempt_id;

    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'mode', v_attempt.mode,
        'exam_title', v_attempt.exam_title,
        'subject', v_attempt.subject,
        'duration_minutes', v_attempt.duration_minutes,
        'total_questions', v_attempt.total_questions,
        'questions', COALESCE(v_questions, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.9. Hàm xem lại bài thi sau khi nộp (Hiện đáp án đúng & giải thích)
CREATE OR REPLACE FUNCTION public.fn_get_attempt_review(p_attempt_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_attempt RECORD;
    v_details JSONB;
BEGIN
    SELECT * INTO v_attempt FROM public.exam_attempts WHERE id = p_attempt_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy lượt thi!';
    END IF;

    -- Chỉ cho phép xem nếu bài thi đã hoàn thành hoặc ở chế độ practice
    IF v_attempt.status = 'in_progress' AND v_attempt.mode = 'real' THEN
        RAISE EXCEPTION 'Bài thi đang trong thời gian làm bài, chưa thể xem đáp án!';
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'question_id', q.id,
            'content', q.content,
            'question_type', q.question_type,
            'explanation', q.explanation,
            'student_selected_options', eaa.selected_option_ids,
            'is_correct', eaa.is_correct,
            'options', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', qo.id,
                        'option_key', qo.option_key,
                        'content', qo.content,
                        'is_correct', qo.is_correct
                    ) ORDER BY qo.sort_order
                )
                FROM public.question_options qo
                WHERE qo.question_id = q.id
            )
        )
    ) INTO v_details
    FROM public.exam_attempt_answers eaa
    JOIN public.questions q ON eaa.question_id = q.id
    WHERE eaa.attempt_id = p_attempt_id;

    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'score', v_attempt.score,
        'correct_answers_count', v_attempt.correct_answers_count,
        'total_questions', v_attempt.total_questions,
        'is_passed', v_attempt.is_passed,
        'academic_rank', v_attempt.academic_rank,
        'review_items', COALESCE(v_details, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. HÀM KIỂM TRA PHÂN QUYỀN TRỢ GIÚP (HELPER FUNCTIONS)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'teacher' AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Kiểm tra giáo viên có phụ trách đúng LỚP và MÔN HỌC này không
CREATE OR REPLACE FUNCTION public.is_teacher_of_class_and_subject(target_class_id UUID, target_subject subject_type)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.teacher_classes 
        WHERE teacher_id = auth.uid() 
          AND class_id = target_class_id 
          AND subject = target_subject
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Kiểm tra giáo viên có được phân công giảng dạy môn học này không
CREATE OR REPLACE FUNCTION public.is_teacher_of_subject(target_subject subject_type)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.teacher_classes 
        WHERE teacher_id = auth.uid() AND subject = target_subject
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 7. THIẾT LẬP BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS)
-- ============================================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 7.1. Bảng classes
CREATE POLICY "classes_select_all" ON public.classes 
    FOR SELECT TO authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY "classes_admin_all" ON public.classes 
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7.2. Bảng users
CREATE POLICY "users_select_own" ON public.users 
    FOR SELECT TO authenticated 
    USING (
        id = auth.uid() 
        OR public.is_admin()
        OR (public.is_teacher() AND class_id IN (SELECT class_id FROM public.teacher_classes WHERE teacher_id = auth.uid()))
    );

CREATE POLICY "users_update_own" ON public.users 
    FOR UPDATE TO authenticated 
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (
        public.is_admin() 
        OR (id = auth.uid() AND role = (SELECT role FROM public.users WHERE id = auth.uid())) -- Không thể tự nâng quyền
    );

-- 7.3. Bảng teacher_classes
CREATE POLICY "teacher_classes_select" ON public.teacher_classes 
    FOR SELECT TO authenticated 
    USING (teacher_id = auth.uid() OR public.is_admin());

CREATE POLICY "teacher_classes_admin" ON public.teacher_classes 
    FOR ALL TO authenticated 
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7.4. Bảng exam_configs
CREATE POLICY "exam_configs_select" ON public.exam_configs 
    FOR SELECT TO authenticated 
    USING (is_active = true OR public.is_admin() OR public.is_teacher());

CREATE POLICY "exam_configs_admin" ON public.exam_configs 
    FOR ALL TO authenticated 
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7.5. Bảng questions
CREATE POLICY "questions_select" ON public.questions 
    FOR SELECT TO authenticated 
    USING (
        public.is_admin()
        OR (public.is_teacher() AND (status = 'approved' OR contributed_by = auth.uid()))
        OR (public.get_user_role() = 'student' AND status = 'approved' AND is_active = true AND is_deleted = false)
    );

CREATE POLICY "questions_insert_teacher_admin" ON public.questions 
    FOR INSERT TO authenticated 
    WITH CHECK (
        public.is_admin()
        OR (public.is_teacher() AND status = 'pending' AND contributed_by = auth.uid() AND public.is_teacher_of_subject(subject))
    );

CREATE POLICY "questions_update_admin_or_teacher_resubmit" ON public.questions 
    FOR UPDATE TO authenticated 
    USING (
        public.is_admin()
        OR (public.is_teacher() AND contributed_by = auth.uid() AND status IN ('pending', 'rejected'))
    )
    WITH CHECK (
        public.is_admin()
        OR (public.is_teacher() AND contributed_by = auth.uid())
    );

CREATE POLICY "questions_delete_admin" ON public.questions 
    FOR DELETE TO authenticated 
    USING (public.is_admin());

-- 7.6. Bảng question_options
-- BẢO MẬT CHỐNG F12: Chỉ Giáo viên và Admin mới được SELECT trực tiếp bảng question_options có chứa is_correct
CREATE POLICY "question_options_select_authorized" ON public.question_options 
    FOR SELECT TO authenticated 
    USING (
        public.is_admin() 
        OR (public.is_teacher() AND EXISTS (
            SELECT 1 FROM public.questions q 
            WHERE q.id = question_id AND (q.status = 'approved' OR q.contributed_by = auth.uid())
        ))
    );

CREATE POLICY "question_options_manage" ON public.question_options 
    FOR ALL TO authenticated 
    USING (
        public.is_admin() 
        OR EXISTS (
            SELECT 1 FROM public.questions q 
            WHERE q.id = question_id AND q.contributed_by = auth.uid() AND q.status IN ('pending', 'rejected')
        )
    );

-- 7.7. Bảng exam_attempts
-- BẢO MẬT & TOÀN VẸN BÁO CÁO:
-- Học sinh xóa mềm (is_student_deleted = true) chỉ ẩn ở màn hình học sinh.
-- Giáo viên bộ môn của lớp và Admin luôn nhìn thấy để chấm điểm & lập báo cáo.
CREATE POLICY "exam_attempts_select" ON public.exam_attempts 
    FOR SELECT TO authenticated 
    USING (
        (public.get_user_role() = 'student' AND user_id = auth.uid() AND is_student_deleted = false)
        OR (public.is_teacher() AND public.is_teacher_of_class_and_subject(class_id, subject))
        OR public.is_admin()
    );

CREATE POLICY "exam_attempts_insert_student" ON public.exam_attempts 
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "exam_attempts_update_student_or_admin" ON public.exam_attempts 
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 7.8. Bảng exam_attempt_answers
CREATE POLICY "attempt_answers_select" ON public.exam_attempt_answers 
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.exam_attempts ea 
            WHERE ea.id = attempt_id AND (
                (ea.user_id = auth.uid() AND (ea.mode = 'practice' OR ea.status IN ('completed', 'timed_out')))
                OR (public.is_teacher() AND public.is_teacher_of_class_and_subject(ea.class_id, ea.subject))
                OR public.is_admin()
            )
        )
    );

CREATE POLICY "attempt_answers_insert_student" ON public.exam_attempt_answers 
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.exam_attempts ea 
            WHERE ea.id = attempt_id AND ea.user_id = auth.uid() AND ea.status = 'in_progress'
        )
    );

CREATE POLICY "attempt_answers_update_student" ON public.exam_attempt_answers 
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.exam_attempts ea 
            WHERE ea.id = attempt_id AND ea.user_id = auth.uid() AND ea.status = 'in_progress'
        )
    );

-- 7.9. Bảng ai_chat_logs
CREATE POLICY "ai_logs_select" ON public.ai_chat_logs 
    FOR SELECT TO authenticated 
    USING (
        user_id = auth.uid() 
        OR public.is_admin()
        OR (public.is_teacher() AND EXISTS (
            SELECT 1 FROM public.exam_attempts ea 
            WHERE ea.id = attempt_id AND public.is_teacher_of_class_and_subject(ea.class_id, ea.subject)
        ))
    );

CREATE POLICY "ai_logs_insert" ON public.ai_chat_logs 
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

-- 7.10. Bảng question_import_logs
CREATE POLICY "import_logs_admin_teacher" ON public.question_import_logs 
    FOR ALL TO authenticated 
    USING (public.is_admin() OR (public.is_teacher() AND imported_by = auth.uid()))
    WITH CHECK (public.is_admin() OR (public.is_teacher() AND imported_by = auth.uid()));

-- 7.11. Bảng notifications
CREATE POLICY "notifications_user_own" ON public.notifications 
    FOR ALL TO authenticated 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 8. VIEWS VÀ HÀM RPC CHO DASHBOARD & BÁO CÁO (Flow 07 & 10)
-- ============================================================================

-- 8.1. View Bảng xếp hạng (Leaderboard) - XẾP HẠNG THEO HỌC SINH (Lấy lượt thi tốt nhất của mỗi học sinh)
-- Bao gồm cả bài nộp timed_out, không bị ẩn khi học sinh xóa mềm cá nhân, hỗ trợ phân loại theo mode
CREATE OR REPLACE VIEW public.view_leaderboard 
WITH (security_invoker = true) AS
WITH student_best_attempts AS (
    SELECT DISTINCT ON (ea.user_id, ea.subject, COALESCE(ea.exam_config_id, '00000000-0000-0000-0000-000000000000'::uuid), ea.mode)
        ea.id AS attempt_id,
        ea.user_id,
        u.full_name AS student_name,
        u.email AS student_email,
        c.code AS class_code,
        ea.subject,
        ea.exam_config_id,
        ea.exam_title,
        ea.mode,
        ea.score,
        ea.time_spent_seconds,
        ea.academic_rank,
        ea.submitted_at,
        ea.auto_submitted
    FROM public.exam_attempts ea
    JOIN public.users u ON ea.user_id = u.id
    LEFT JOIN public.classes c ON ea.class_id = c.id
    WHERE ea.status IN ('completed', 'timed_out')
    ORDER BY 
        ea.user_id, 
        ea.subject, 
        COALESCE(ea.exam_config_id, '00000000-0000-0000-0000-000000000000'::uuid), 
        ea.mode,
        ea.score DESC, 
        ea.time_spent_seconds ASC, 
        ea.submitted_at DESC
)
SELECT 
    attempt_id,
    user_id,
    student_name,
    student_email,
    class_code,
    subject,
    exam_config_id,
    exam_title,
    mode,
    score,
    time_spent_seconds,
    academic_rank,
    submitted_at,
    auto_submitted,
    DENSE_RANK() OVER (
        PARTITION BY subject, COALESCE(exam_config_id, '00000000-0000-0000-0000-000000000000'::uuid), mode 
        ORDER BY score DESC, time_spent_seconds ASC
    ) AS rank_position
FROM student_best_attempts;

-- 8.2. View Thống kê điểm số theo Lớp và Môn (Đánh giá chất lượng giảng dạy của Giáo viên)
-- Bao gồm cả bài thi thật và thi thử, tính tổng số học sinh tham gia và tỷ lệ đạt
CREATE OR REPLACE VIEW public.view_class_performance 
WITH (security_invoker = true) AS
SELECT 
    c.id AS class_id,
    c.code AS class_code,
    c.name AS class_name,
    ea.subject,
    ea.mode,
    COUNT(ea.id) AS total_attempts,
    COUNT(DISTINCT ea.user_id) AS total_students,
    ROUND(AVG(ea.score), 2) AS average_score,
    MAX(ea.score) AS highest_score,
    MIN(ea.score) AS lowest_score,
    COUNT(CASE WHEN ea.is_passed THEN 1 END) AS passed_count,
    COUNT(CASE WHEN NOT ea.is_passed THEN 1 END) AS failed_count,
    ROUND((COUNT(CASE WHEN ea.is_passed THEN 1 END)::numeric / NULLIF(COUNT(ea.id), 0)) * 100.0, 1) AS pass_rate_percent
FROM public.exam_attempts ea
JOIN public.classes c ON ea.class_id = c.id
WHERE ea.status IN ('completed', 'timed_out')
GROUP BY c.id, c.code, c.name, ea.subject, ea.mode;
