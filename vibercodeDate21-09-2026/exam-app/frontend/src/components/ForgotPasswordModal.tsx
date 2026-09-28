"use client";

import React, { useState } from "react";
import { X, Mail, KeyRound, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Vui lòng nhập định dạng email hợp lệ");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Vui lòng nhập đủ 6 chữ số mã xác nhận");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    onSuccess(email);
    onClose();
    // Reset state
    setStep(1);
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#486660] dark:text-[#CBE5DF] hover:bg-[#E6F5F2] dark:hover:bg-[#13322E] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#FFEDE5] dark:bg-[#281812] text-[#F26B38] flex items-center justify-center shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#0F2825] dark:text-[#F0F7F5]">
            Khôi phục Mật khẩu
          </h3>
          <p className="text-xs text-[#486660] dark:text-[#CBE5DF] mt-1">
            {step === 1 && "Nhập email đăng ký của bạn để nhận mã xác thực OTP"}
            {step === 2 && `Mã xác nhận 6 số đã được gửi tới ${email}`}
            {step === 3 && "Thiết lập mật khẩu mới an toàn cho tài khoản của bạn"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <span
            className={`w-7 h-1.5 rounded-full transition-all ${
              step >= 1 ? "bg-[#0B8374]" : "bg-[#E0ECE9] dark:bg-[#18423C]"
            }`}
          />
          <span
            className={`w-7 h-1.5 rounded-full transition-all ${
              step >= 2 ? "bg-[#0B8374]" : "bg-[#E0ECE9] dark:bg-[#18423C]"
            }`}
          />
          <span
            className={`w-7 h-1.5 rounded-full transition-all ${
              step === 3 ? "bg-[#F26B38]" : "bg-[#E0ECE9] dark:bg-[#18423C]"
            }`}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Input Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F2825] dark:text-[#CBE5DF] mb-1.5">
                Địa chỉ Email tài khoản
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#486660] dark:text-[#CBE5DF]" />
                <input
                  type="email"
                  required
                  placeholder="vidu@truonghoc.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] placeholder-[#8FAEA7] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B8374] transition"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-[#0B8374] hover:bg-[#08665A] active:scale-[0.99] transition shadow-lg shadow-[#0B8374]/20 flex items-center justify-center space-x-2 text-sm"
            >
              <span>Gửi mã xác thực OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Input OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-bold rounded-xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0B8374] dark:text-[#CBE5DF] focus:outline-none focus:ring-2 focus:ring-[#0B8374]"
                />
              ))}
            </div>
            <div className="text-center text-xs text-[#486660] dark:text-[#CBE5DF]">
              Mã demo gợi ý: <span className="font-mono font-bold text-[#F26B38]">1 2 3 4 5 6</span>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-[#0B8374] hover:bg-[#08665A] active:scale-[0.99] transition shadow-lg shadow-[#0B8374]/20 text-sm"
            >
              Xác thực mã OTP
            </button>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F2825] dark:text-[#CBE5DF] mb-1.5">
                Mật khẩu mới
              </label>
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] placeholder-[#8FAEA7] text-sm focus:outline-none focus:ring-2 focus:ring-[#F26B38] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F2825] dark:text-[#CBE5DF] mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E0ECE9] dark:border-[#18423C] bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] placeholder-[#8FAEA7] text-sm focus:outline-none focus:ring-2 focus:ring-[#F26B38] transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-[#F26B38] hover:bg-[#D95423] active:scale-[0.99] transition shadow-lg shadow-[#F26B38]/20 flex items-center justify-center space-x-2 text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Cập nhật mật khẩu mới</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
