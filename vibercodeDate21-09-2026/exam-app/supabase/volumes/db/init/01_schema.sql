-- ============================================================================
-- EXAM APP - SUPABASE DATABASE SCHEMA (01_schema.sql)
-- Căn cứ theo 10 Flows nghiệp vụ (Hóa, Sinh, Tiếng Anh)
-- Hỗ trợ: Role-based access (Student, Teacher, Admin), LaTeX Formulas,
-- Multi-choice answers, Soft delete, Auto-submit, 10-point scale grading & RLS
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

-- 3.2. BẢNG HỒ SƠ NGƯỜI DÙNG (PROFILES) - Liên kết auth.users (Flow 01)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL, -- Học sinh bắt buộc có lớp
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3. BẢNG PHÂN CÔNG GIÁO VIÊN PHỤ TRÁCH LỚP (TEACHER_CLASSES) - Flow 06 & 07
CREATE TABLE IF NOT EXISTS public.teacher_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject subject_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(teacher_id, class_id, subject)
);

-- 3.4. BẢNG CẤU HÌNH ĐỀ THI (EXAM_CONFIGS) - Flow 05
CREATE TABLE IF NOT EXISTS public.exam_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subject subject_type NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
    total_questions INT NOT NULL DEFAULT 20 CHECK (total_questions > 0),
    pass_score NUMERIC(4,2) NOT NULL DEFAULT 5.00 CHECK (pass_score >= 0 AND pass_score <= 10),
    shuffle_questions BOOLEAN NOT NULL DEFAULT true,
    shuffle_options BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.5. BẢNG NGÂN HÀNG CÂU HỎI (QUESTIONS) - Flow 08 & 09
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject subject_type NOT NULL,
    content TEXT NOT NULL, -- Hỗ trợ công thức Toán, Lý, Hóa (LaTeX) & tiếng Việt
    image_url TEXT,
    explanation TEXT, -- Lời giải thích đáp án chi tiết (hỗ trợ LaTeX)
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status question_status NOT NULL DEFAULT 'approved', -- 'pending' (chờ duyệt), 'approved', 'rejected'
    rejection_reason TEXT,
    contributed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Giáo viên đề xuất
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Admin phê duyệt
    reviewed_at TIMESTAMPTZ,
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
    is_correct BOOLEAN NOT NULL DEFAULT false, -- Có thể có nhiều đáp án đúng
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(question_id, option_key)
);

-- 3.7. BẢNG LƯỢT THI / BÀI LÀM (EXAM_ATTEMPTS) - Flow 02, 03, 04, 10
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    exam_config_id UUID REFERENCES public.exam_configs(id) ON DELETE SET NULL,
    subject subject_type NOT NULL,
    mode exam_mode NOT NULL DEFAULT 'real', -- 'practice' (thi thử) | 'real' (thi thật)
    status exam_status NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    auto_submitted BOOLEAN NOT NULL DEFAULT false, -- true nếu hết giờ tự động nộp bài
    total_questions INT NOT NULL DEFAULT 20,
    correct_answers_count INT NOT NULL DEFAULT 0,
    score NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (score >= 0 AND score <= 10), -- Thang điểm 10
    is_passed BOOLEAN NOT NULL DEFAULT false, -- Điểm đạt (giao diện xanh / đỏ)
    academic_rank academic_rank, -- Xuất sắc, Giỏi, Khá, Trung bình, Yếu
    is_deleted BOOLEAN NOT NULL DEFAULT false, -- XÓA MỀM (Soft delete)
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.8. BẢNG CHI TIẾT CÂU TRẢ LỜI CỦA THÍ SINH (EXAM_ATTEMPT_ANSWERS) - Flow 03 & 04
CREATE TABLE IF NOT EXISTS public.exam_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_ids UUID[] NOT NULL DEFAULT '{}', -- Danh sách ID đáp án được chọn (multi-select)
    is_correct BOOLEAN NOT NULL DEFAULT false,
    points_awarded NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(attempt_id, question_id)
);

-- 3.9. BẢNG NHẬT KÝ CHATBOT AI (AI_CHAT_LOGS) - Flow 03 (Hỏi đáp tại sao đúng trong Thi thử)
CREATE TABLE IF NOT EXISTS public.ai_chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
    student_prompt TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.10. BẢNG NHẬT KÝ IMPORT CÂU HỎI TỪ EXCEL (QUESTION_IMPORT_LOGS) - Flow 09
CREATE TABLE IF NOT EXISTS public.question_import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    total_rows INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    error_count INT NOT NULL DEFAULT 0,
    error_details JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. TẠO INDEXES TỐI ƯU HÓA HIỆU NĂNG TRUY VẤN
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_class_id ON public.profiles(class_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_status ON public.questions(subject, status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_question_options_qid ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_softdel ON public.exam_attempts(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_class_subject ON public.exam_attempts(class_id, subject);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_ranking ON public.exam_attempts(subject, score DESC, time_spent_seconds ASC) WHERE is_deleted = false AND status = 'completed';
CREATE INDEX IF NOT EXISTS idx_exam_attempt_answers_attempt ON public.exam_attempt_answers(attempt_id);

-- ============================================================================
-- 5. HÀM HỖ TRỢ VÀ TRIGGER TỰ ĐỘNG
-- ============================================================================

-- 5.1. Hàm cập nhật `updated_at` tự động
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

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
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

-- 5.2. Trigger tự động tạo hồ sơ profile khi người dùng đăng ký qua Auth (Email / Google)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role public.user_role := 'student';
    v_class_id UUID := NULL;
    v_full_name TEXT := '';
BEGIN
    -- Trích xuất role từ user_metadata nếu có
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
        BEGIN
            v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
        EXCEPTION WHEN OTHERS THEN
            v_role := 'student';
        END;
    END IF;

    -- Trích xuất class_id từ user_metadata
    IF NEW.raw_user_meta_data->>'class_id' IS NOT NULL THEN
        BEGIN
            v_class_id := (NEW.raw_user_meta_data->>'class_id')::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_class_id := NULL;
        END;
    END IF;

    -- Họ và tên
    v_full_name := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'name', ''),
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (id, email, full_name, role, class_id, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        v_full_name,
        v_role,
        v_class_id,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5.3. Hàm xác định xếp loại học lực chuẩn theo thang điểm 10
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

-- 5.4. Hàm nộp bài & chấm điểm bài thi tự động (Flow 04)
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

    -- Lấy pass_score từ exam_configs nếu có
    IF v_attempt.exam_config_id IS NOT NULL THEN
        SELECT pass_score INTO v_pass_score FROM public.exam_configs WHERE id = v_attempt.exam_config_id;
    END IF;

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

        -- Kiểm tra đáp án của thí sinh có khớp chính xác 100% với đáp án đúng không (multi-choice)
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

    -- Tính tổng số câu hỏi
    SELECT COUNT(*) INTO v_total_questions FROM public.exam_attempt_answers WHERE attempt_id = p_attempt_id;
    IF v_total_questions = 0 THEN
        v_total_questions := v_attempt.total_questions;
    END IF;

    -- Tính điểm trên thang 10
    IF v_total_questions > 0 THEN
        v_score := ROUND((v_correct_count::numeric / v_total_questions::numeric) * 10.0, 2);
    ELSE
        v_score := 0.00;
    END IF;

    v_is_passed := (v_score >= v_pass_score);
    v_rank := public.fn_get_academic_rank(v_score);

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

    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'total_questions', v_total_questions,
        'correct_count', v_correct_count,
        'score', v_score,
        'is_passed', v_is_passed,
        'academic_rank', v_rank,
        'auto_submitted', p_auto_submitted
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.5. Hàm xóa mềm bài thi của thí sinh (Flow 02)
CREATE OR REPLACE FUNCTION public.fn_soft_delete_attempt(p_attempt_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_current_user UUID := auth.uid();
BEGIN
    SELECT user_id INTO v_user_id FROM public.exam_attempts WHERE id = p_attempt_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bài thi không tồn tại!';
    END IF;

    -- Thí sinh chỉ được xóa bài thi của chính mình, Admin có thể xóa bất kỳ bài nào
    IF v_user_id != v_current_user AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Bạn không có quyền xóa bài thi của thí sinh khác!';
    END IF;

    UPDATE public.exam_attempts
    SET is_deleted = true,
        deleted_at = now()
    WHERE id = p_attempt_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. CÁC HÀM TIỆN ÍCH KIỂM TRA QUYỀN (SECURITY DEFINER CHO RLS)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'teacher' AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher_of_class(target_class_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.teacher_classes 
        WHERE teacher_id = auth.uid() AND class_id = target_class_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 7. THIẾT LẬP BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS)
-- ============================================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_import_logs ENABLE ROW LEVEL SECURITY;

-- 7.1. Chính sách cho bảng classes
CREATE POLICY "classes_select_all" ON public.classes 
    FOR SELECT TO public USING (is_active = true OR public.is_admin());

CREATE POLICY "classes_admin_all" ON public.classes 
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7.2. Chính sách cho bảng profiles
CREATE POLICY "profiles_select_own" ON public.profiles 
    FOR SELECT TO authenticated 
    USING (
        id = auth.uid() 
        OR public.is_admin()
        OR (public.is_teacher() AND class_id IN (SELECT class_id FROM public.teacher_classes WHERE teacher_id = auth.uid()))
    );

CREATE POLICY "profiles_update_own" ON public.profiles 
    FOR UPDATE TO authenticated 
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (
        public.is_admin() 
        OR (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())) -- Không tự nâng quyền
    );

-- 7.3. Chính sách cho bảng teacher_classes
CREATE POLICY "teacher_classes_select" ON public.teacher_classes 
    FOR SELECT TO authenticated 
    USING (teacher_id = auth.uid() OR public.is_admin());

CREATE POLICY "teacher_classes_admin" ON public.teacher_classes 
    FOR ALL TO authenticated 
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7.4. Chính sách cho bảng exam_configs
CREATE POLICY "exam_configs_select" ON public.exam_configs 
    FOR SELECT TO authenticated 
    USING (is_active = true OR public.is_admin());

CREATE POLICY "exam_configs_admin" ON public.exam_configs 
    FOR ALL TO authenticated 
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7.5. Chính sách cho bảng questions & question_options
CREATE POLICY "questions_select" ON public.questions 
    FOR SELECT TO authenticated 
    USING (
        public.is_admin()
        OR (public.is_teacher() AND (status = 'approved' OR contributed_by = auth.uid()))
        OR (public.get_user_role() = 'student' AND status = 'approved' AND is_active = true)
    );

CREATE POLICY "questions_insert_teacher_admin" ON public.questions 
    FOR INSERT TO authenticated 
    WITH CHECK (
        public.is_admin()
        OR (public.is_teacher() AND status = 'pending' AND contributed_by = auth.uid())
    );

CREATE POLICY "questions_update_admin_or_teacher_pending" ON public.questions 
    FOR UPDATE TO authenticated 
    USING (
        public.is_admin()
        OR (public.is_teacher() AND contributed_by = auth.uid() AND status = 'pending')
    );

CREATE POLICY "questions_delete_admin" ON public.questions 
    FOR DELETE TO authenticated 
    USING (public.is_admin());

CREATE POLICY "question_options_select" ON public.question_options 
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q 
            WHERE q.id = question_id AND (
                public.is_admin() 
                OR (public.is_teacher() AND (q.status = 'approved' OR q.contributed_by = auth.uid()))
                OR (public.get_user_role() = 'student' AND q.status = 'approved')
            )
        )
    );

CREATE POLICY "question_options_manage" ON public.question_options 
    FOR ALL TO authenticated 
    USING (
        public.is_admin() 
        OR EXISTS (
            SELECT 1 FROM public.questions q 
            WHERE q.id = question_id AND q.contributed_by = auth.uid() AND q.status = 'pending'
        )
    );

-- 7.6. Chính sách cho bảng exam_attempts (Quy định nghiêm ngặt: thí sinh chỉ xem/xóa bài của mình)
CREATE POLICY "exam_attempts_select" ON public.exam_attempts 
    FOR SELECT TO authenticated 
    USING (
        (public.get_user_role() = 'student' AND user_id = auth.uid() AND is_deleted = false)
        OR (public.is_teacher() AND public.is_teacher_of_class(class_id) AND is_deleted = false)
        OR public.is_admin() -- Admin xem được toàn bộ, kể cả bài đã xóa mềm để phục hồi
    );

CREATE POLICY "exam_attempts_insert_student" ON public.exam_attempts 
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "exam_attempts_update_student_or_admin" ON public.exam_attempts 
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 7.7. Chính sách cho bảng exam_attempt_answers
CREATE POLICY "exam_answers_select" ON public.exam_attempt_answers 
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.exam_attempts a 
            WHERE a.id = attempt_id AND (
                (a.user_id = auth.uid() AND a.is_deleted = false)
                OR (public.is_teacher() AND public.is_teacher_of_class(a.class_id))
                OR public.is_admin()
            )
        )
    );

CREATE POLICY "exam_answers_insert_update" ON public.exam_attempt_answers 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.exam_attempts a 
            WHERE a.id = attempt_id AND a.user_id = auth.uid() AND a.status = 'in_progress'
        )
    );

-- 7.8. Chính sách cho bảng ai_chat_logs
CREATE POLICY "ai_chat_logs_manage_own" ON public.ai_chat_logs 
    FOR ALL TO authenticated 
    USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 7.9. Chính sách cho bảng question_import_logs
CREATE POLICY "import_logs_admin_teacher" ON public.question_import_logs 
    FOR ALL TO authenticated 
    USING (public.is_admin() OR (public.is_teacher() AND imported_by = auth.uid()))
    WITH CHECK (public.is_admin() OR (public.is_teacher() AND imported_by = auth.uid()));

-- ============================================================================
-- 8. VIEWS VÀ HÀM RPC CHO DASHBOARD & BÁO CÁO (Flow 07 & 10)
-- ============================================================================

-- 8.1. View Bảng xếp hạng (Leaderboard)
CREATE OR REPLACE VIEW public.view_leaderboard AS
SELECT 
    ea.id AS attempt_id,
    p.full_name AS student_name,
    p.email AS student_email,
    c.code AS class_code,
    ea.subject,
    ea.score,
    ea.time_spent_seconds,
    ea.academic_rank,
    ea.submitted_at,
    DENSE_RANK() OVER (PARTITION BY ea.subject ORDER BY ea.score DESC, ea.time_spent_seconds ASC) AS rank_position
FROM public.exam_attempts ea
JOIN public.profiles p ON ea.user_id = p.id
LEFT JOIN public.classes c ON ea.class_id = c.id
WHERE ea.is_deleted = false 
  AND ea.status = 'completed'
  AND ea.mode = 'real';

-- 8.2. View Thống kê điểm số theo Lớp và Môn (Đánh giá chất lượng giảng dạy của Giáo viên)
CREATE OR REPLACE VIEW public.view_class_performance AS
SELECT 
    c.id AS class_id,
    c.code AS class_code,
    c.name AS class_name,
    ea.subject,
    COUNT(ea.id) AS total_attempts,
    ROUND(AVG(ea.score), 2) AS average_score,
    MAX(ea.score) AS highest_score,
    MIN(ea.score) AS lowest_score,
    COUNT(CASE WHEN ea.is_passed THEN 1 END) AS passed_count,
    COUNT(CASE WHEN NOT ea.is_passed THEN 1 END) AS failed_count,
    ROUND((COUNT(CASE WHEN ea.is_passed THEN 1 END)::numeric / NULLIF(COUNT(ea.id), 0)) * 100.0, 1) AS pass_rate_percent
FROM public.exam_attempts ea
JOIN public.classes c ON ea.class_id = c.id
WHERE ea.is_deleted = false 
  AND ea.status = 'completed'
  AND ea.mode = 'real'
GROUP BY c.id, c.code, c.name, ea.subject;

-- 8.3. RPC Function lấy danh sách Top thí sinh điểm cao nhất (Top 10/20/50 - Flow 10)
CREATE OR REPLACE FUNCTION public.rpc_get_top_students(
    p_subject TEXT DEFAULT NULL,
    p_class_id UUID DEFAULT NULL,
    p_limit INT DEFAULT 20,
    p_sort_by TEXT DEFAULT 'score_desc' -- 'score_desc', 'score_asc', 'time_asc', 'time_desc'
)
RETURNS TABLE (
    attempt_id UUID,
    student_name VARCHAR,
    student_email VARCHAR,
    class_code VARCHAR,
    subject public.subject_type,
    score NUMERIC,
    time_spent_seconds INT,
    academic_rank public.academic_rank,
    submitted_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ea.id,
        p.full_name,
        p.email,
        c.code,
        ea.subject,
        ea.score,
        ea.time_spent_seconds,
        ea.academic_rank,
        ea.submitted_at
    FROM public.exam_attempts ea
    JOIN public.profiles p ON ea.user_id = p.id
    LEFT JOIN public.classes c ON ea.class_id = c.id
    WHERE ea.is_deleted = false 
      AND ea.status = 'completed'
      AND ea.mode = 'real'
      AND (p_subject IS NULL OR ea.subject = p_subject::public.subject_type)
      AND (p_class_id IS NULL OR ea.class_id = p_class_id)
    ORDER BY 
        CASE WHEN p_sort_by = 'score_desc' THEN ea.score END DESC,
        CASE WHEN p_sort_by = 'score_desc' THEN ea.time_spent_seconds END ASC,
        CASE WHEN p_sort_by = 'time_asc' THEN ea.time_spent_seconds END ASC,
        CASE WHEN p_sort_by = 'score_asc' THEN ea.score END ASC,
        CASE WHEN p_sort_by = 'time_desc' THEN ea.time_spent_seconds END DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
