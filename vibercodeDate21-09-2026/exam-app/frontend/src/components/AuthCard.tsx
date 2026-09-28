"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { UserProfile, UserRole } from "@/types";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface AuthCardProps {
  onAuthSuccess: (user: UserProfile) => void;
  onOpenForgotPassword: () => void;
  onToast: (type: "success" | "error" | "info", title: string, message: string) => void;
}

const CLASS_LIST = [
  "10A1 - Chuyên Tự Nhiên",
  "10A2 - Khối Cơ Bản",
  "10A3 - Khối Tự Nhiên",
  "11B1 - Chuyên Hóa - Sinh",
  "11B2 - Khối Tự Nhiên",
  "12A1 - Luyện Thi Đại Học A1",
  "12A2 - Luyện Thi Đại Học D1",
  "12A3 - Khối Tự Nhiên VIP",
];

export const AuthCard: React.FC<AuthCardProps> = ({
  onAuthSuccess,
  onOpenForgotPassword,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpClass, setSignUpClass] = useState("12A1 - Luyện Thi Đại Học A1");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "Chưa nhập", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, text: "Yếu", color: "bg-red-500" };
    if (score <= 3) return { score: 2, text: "Trung bình", color: "bg-amber-500" };
    return { score: 3, text: "Mạnh", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(signUpPassword);

  // Trigger confetti effect
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F26B38", "#0B8374", "#CBE5DF", "#FFFFFF"],
      });
    } catch (_) {}
  };

  // Google OAuth Demo Handler
  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      triggerConfetti();
      const mockGoogleUser: UserProfile = {
        id: "usr_google_123",
        name: "Nguyễn Minh Đức (Google)",
        email: "minhduc.google@gmail.com",
        role: "student",
        className: "12A1",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      };
      onToast("success", "Đăng nhập Google thành công", "Chào mừng bạn gia nhập phòng thi ExamApp!");
      onAuthSuccess(mockGoogleUser);
    }, 700);
  };

  // Sign In Submit Handler
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      onToast("error", "Thiếu thông tin", "Vui lòng nhập đầy đủ Email và Mật khẩu");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      triggerConfetti();

      // Check role based on email or default to student
      let role: UserRole = "student";
      let name = "Nguyễn Văn An";
      if (signInEmail.toLowerCase().includes("admin")) {
        role = "admin";
        name = "Quản Trị Viên Hệ Thống";
      } else if (signInEmail.toLowerCase().includes("teacher") || signInEmail.toLowerCase().includes("giaovien")) {
        role = "teacher";
        name = "Cô Trần Thị Mai";
      }

      const user: UserProfile = {
        id: "usr_" + Math.random().toString(36).substring(7),
        name: name,
        email: signInEmail,
        role: role,
        className: role === "student" ? "12A1" : undefined,
        assignedClasses: role === "teacher" ? ["10A1 - Hóa", "11B2 - Sinh"] : undefined,
      };

      onToast("success", "Đăng nhập thành công", `Chào mừng ${user.name} trở lại!`);
      onAuthSuccess(user);
    }, 600);
  };

  // Sign Up Submit Handler
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      onToast("error", "Thiếu thông tin", "Vui lòng điền đủ Họ tên, Email và Mật khẩu");
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      onToast("error", "Mật khẩu không khớp", "Xác nhận mật khẩu phải trùng khớp với mật khẩu mới");
      return;
    }
    if (!agreeTerms) {
      onToast("error", "Điều khoản", "Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      triggerConfetti();

      const shortClass = signUpClass.split(" - ")[0];
      const newUser: UserProfile = {
        id: "usr_" + Math.random().toString(36).substring(7),
        name: signUpName,
        email: signUpEmail,
        role: "student",
        className: shortClass,
      };

      onToast("success", "Đăng ký thành công", `Tài khoản đã tạo cho học sinh lớp ${shortClass}!`);
      onAuthSuccess(newUser);
    }, 700);
  };

  // Quick Demo Role Click
  const handleQuickDemo = (role: UserRole) => {
    triggerConfetti();
    const demoUsers: Record<UserRole, UserProfile> = {
      student: {
        id: "demo_student",
        name: "Lê Hoàng Nam",
        email: "hoangnam.student@exam.edu.vn",
        role: "student",
        className: "12A1",
      },
      teacher: {
        id: "demo_teacher",
        name: "Thầy Đỗ Minh Quân",
        email: "minhquan.teacher@exam.edu.vn",
        role: "teacher",
        assignedClasses: ["10A1 - Hóa Học", "11B2 - Sinh Học"],
      },
      admin: {
        id: "demo_admin",
        name: "Ban Quản Trị Trung Tâm",
        email: "admin@exam.edu.vn",
        role: "admin",
      },
    };

    const targetUser = demoUsers[role];
    onToast("info", "Đăng nhập Demo", `Đang vào với vai trò: ${role.toUpperCase()}`);
    onAuthSuccess(targetUser);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/95 dark:bg-[#0D2522]/95 backdrop-blur-2xl border border-[#E0ECE9] dark:border-[#18423C] rounded-3xl p-6 sm:p-9 shadow-2xl shadow-[#0B8374]/10 transition-all">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#E6F5F2] dark:bg-[#071513] border border-[#0B8374]/20 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("signin")}
          className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
            activeTab === "signin"
              ? "bg-[#F26B38] text-white shadow-md shadow-[#F26B38]/30 scale-[1.01]"
              : "text-[#486660] dark:text-[#CBE5DF] hover:text-[#0B8374] dark:hover:text-[#F0F7F5]"
          }`}
        >
          Đăng Nhập
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("signup")}
          className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
            activeTab === "signup"
              ? "bg-[#0B8374] text-white shadow-md shadow-[#0B8374]/30 scale-[1.01]"
              : "text-[#486660] dark:text-[#CBE5DF] hover:text-[#0B8374] dark:hover:text-[#F0F7F5]"
          }`}
        >
          Đăng Ký Tài Khoản
        </button>
      </div>

      {/* Google 1-Touch Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl border border-[#E0ECE9] dark:border-[#18423C] bg-white dark:bg-[#0E2421] hover:bg-[#F7FAF9] dark:hover:bg-[#13322E] text-[#0F2825] dark:text-[#F0F7F5] font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center space-x-3 active:scale-[0.99] group"
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {activeTab === "signin" ? "Đăng nhập nhanh với Google" : "Đăng ký nhanh với Google"}
          </span>
        </button>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E0ECE9] dark:border-[#18423C]" />
          </div>
          <span className="relative px-4 text-[11px] font-bold uppercase tracking-wider bg-white dark:bg-[#0D2522] text-[#486660] dark:text-[#8FAEA7]">
            Hoặc điền thông tin bên dưới
          </span>
        </div>
      </div>

      {/* SIGN IN FORM */}
      {activeTab === "signin" && (
        <form onSubmit={handleSignInSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F2825] dark:text-[#CBE5DF] mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#486660] dark:text-[#CBE5DF]" />
              <input
                type="email"
                name="email"
                id="signin-email"
                autoComplete="username"
                required
                placeholder="tenban@truonghoc.edu.vn"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] placeholder-[#8FAEA7] text-sm focus:outline-none focus:ring-2 focus:ring-[#F26B38] transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#0F2825] dark:text-[#CBE5DF]">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={onOpenForgotPassword}
                className="text-xs font-bold text-[#F26B38] hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#486660] dark:text-[#CBE5DF]" />
              <input
                type={showSignInPassword ? "text" : "password"}
                name="password"
                id="signin-password"
                autoComplete="current-password"
                required
                placeholder="Nhập mật khẩu"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-2xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] placeholder-[#8FAEA7] text-sm focus:outline-none focus:ring-2 focus:ring-[#F26B38] transition"
              />
              <button
                type="button"
                onClick={() => setShowSignInPassword(!showSignInPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#486660] dark:text-[#CBE5DF] hover:text-[#F26B38] transition"
              >
                {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#F26B38] focus:ring-[#F26B38] border-[#E0ECE9] dark:border-[#18423C]"
              />
              <span className="text-xs text-[#486660] dark:text-[#CBE5DF] font-medium">
                Ghi nhớ đăng nhập trên thiết bị này
              </span>
            </label>
          </div>

          {/* Submit Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-2xl font-black text-sm text-white bg-[#F26B38] hover:bg-[#D95423] active:scale-[0.99] transition shadow-lg shadow-[#F26B38]/30 flex items-center justify-center space-x-2"
          >
            <span>ĐĂNG NHẬP VÀO PHÒNG THI</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Roles Box */}
          <div className="pt-5 border-t border-[#E0ECE9] dark:border-[#18423C]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-center text-[#486660] dark:text-[#8FAEA7] mb-2.5">
              ⚡ Hoặc Đăng Nhập Nhanh Để Trải Nghiệm (Demo Roles)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("student")}
                className="py-2 px-1.5 rounded-xl border border-[#0B8374]/30 bg-[#E6F5F2] dark:bg-[#13322E] text-[#0B8374] dark:text-[#CBE5DF] text-[11px] font-bold hover:bg-[#0B8374] hover:text-white transition text-center"
              >
                🎓 Thí Sinh
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("teacher")}
                className="py-2 px-1.5 rounded-xl border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition text-center"
              >
                👩‍🏫 Giáo Viên
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                className="py-2 px-1.5 rounded-xl border border-[#F26B38]/30 bg-[#FFEDE5] dark:bg-[#281812] text-[#F26B38] text-[11px] font-bold hover:bg-[#F26B38] hover:text-white transition text-center"
              >
                ⚡ Quản Trị
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SIGN UP FORM */}
      {activeTab === "signup" && (
        <form onSubmit={handleSignUpSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F2825] dark:text-[#CBE5DF] mb-1.5">
              Họ và tên thí sinh
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#486660] dark:text-[#CBE5DF]" />
              <input
                type="text"
                name="name"
                id="signup-name"
                autoComplete="name"
                required
                placeholder="Ví dụ: Nguyễn Văn Hoàng"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] placeholder-[#8FAEA7] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B8374] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2825] dark:text-[#CBE5DF] mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#486660] dark:text-[#CBE5DF]" />
              <input
                type="email"
                name="email"
                id="signup-email"
                autoComplete="username"
                required
                placeholder="tenban@truonghoc.edu.vn"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] placeholder-[#8FAEA7] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B8374] transition"
              />
            </div>
          </div>

          {/* Class Allocation Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#0F2825] dark:text-[#CBE5DF] mb-1.5">
              Lớp học phụ trách / đang học (Bắt buộc theo quy định)
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#486660] dark:text-[#CBE5DF]" />
              <select
                value={signUpClass}
                onChange={(e) => setSignUpClass(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-2xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B8374] transition appearance-none cursor-pointer"
              >
                {CLASS_LIST.map((cls, idx) => (
                  <option key={idx} value={cls} className="bg-white dark:bg-[#0D2522]">
                    {cls}
                  </option>
                ))}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#486660] dark:text-[#CBE5DF]">
                ▼
              </span>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-[#0F2825] dark:text-[#CBE5DF] mb-1.5">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#486660] dark:text-[#CBE5DF]" />
              <input
                type={showSignUpPassword ? "text" : "password"}
                name="password"
                id="signup-password"
                autoComplete="new-password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] placeholder-[#8FAEA7] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B8374] transition"
              />
              <button
                type="button"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#486660] dark:text-[#CBE5DF] hover:text-[#0B8374] transition"
              >
                {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {signUpPassword && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 h-1.5 bg-[#E0ECE9] dark:bg-[#18423C] rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-[#486660] dark:text-[#CBE5DF]">
                  Độ mạnh: {passwordStrength.text}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-[#0F2825] dark:text-[#CBE5DF] mb-1.5">
              Xác nhận lại mật khẩu
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#486660] dark:text-[#CBE5DF]" />
              <input
                type={showSignUpPassword ? "text" : "password"}
                name="confirm-password"
                id="signup-confirm-password"
                autoComplete="new-password"
                required
                placeholder="Nhập lại chính xác mật khẩu"
                value={signUpConfirmPassword}
                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] placeholder-[#8FAEA7] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B8374] transition"
              />
            </div>
            {signUpConfirmPassword && (
              <p
                className={`text-[11px] font-bold mt-1 ${
                  signUpPassword === signUpConfirmPassword
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500"
                }`}
              >
                {signUpPassword === signUpConfirmPassword
                  ? "✓ Mật khẩu đã khớp hoàn hảo"
                  : "✕ Mật khẩu chưa trùng khớp"}
              </p>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="pt-1">
            <label className="flex items-start space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#0B8374] focus:ring-[#0B8374] border-[#E0ECE9] dark:border-[#18423C]"
              />
              <span className="text-xs text-[#486660] dark:text-[#CBE5DF]">
                Tôi đồng ý với{" "}
                <span className="text-[#0B8374] font-bold underline">Quy chế phòng thi</span> và{" "}
                <span className="text-[#0B8374] font-bold underline">Chính sách bảo mật</span> của ExamApp.
              </span>
            </label>
          </div>

          {/* Submit Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl font-black text-sm text-white bg-[#0B8374] hover:bg-[#08665A] active:scale-[0.99] transition shadow-lg shadow-[#0B8374]/30 flex items-center justify-center space-x-2"
          >
            <span>TẠO TÀI KHOẢN VÀ VÀO PHÒNG THI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
