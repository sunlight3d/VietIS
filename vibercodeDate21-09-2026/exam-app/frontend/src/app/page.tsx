"use client";

import React, { useState } from "react";
import { UserProfile, ToastNotification } from "@/types";
import { Navbar } from "@/components/Navbar";
import { HeroBranding } from "@/components/HeroBranding";
import { AuthCard } from "@/components/AuthCard";
import { FlowStepsVisualizer } from "@/components/FlowStepsVisualizer";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import { RoleDashboardPreview } from "@/components/RoleDashboardPreview";
import { ToastContainer } from "@/components/Toast";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(2); // Step 2: Choosing method

  // Toast Helper
  const addToast = (
    type: "success" | "error" | "info" | "warning",
    title: string,
    message: string
  ) => {
    const newToast: ToastNotification = {
      id: "toast_" + Date.now() + "_" + Math.random().toString(36).substring(5),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      dismissToast(newToast.id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Success Handler (Flow 01 Step 4 & 5)
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentStep(4);
    setTimeout(() => {
      setCurrentStep(5);
      setCurrentUser(user);
    }, 400);
  };

  // Sign out Handler
  const handleSignOut = () => {
    setCurrentUser(null);
    setCurrentStep(2);
    addToast("info", "Đã đăng xuất", "Bạn đã thoát khỏi phiên làm việc an toàn.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF9] dark:bg-[#071513] text-[#0F2825] dark:text-[#F0F7F5] transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar currentUser={currentUser} onSignOut={handleSignOut} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col justify-center">
        {currentUser ? (
          /* View after successful sign in: Role Dashboard Simulation */
          <div className="space-y-6">
            <FlowStepsVisualizer currentStep={5} />
            <RoleDashboardPreview
              user={currentUser}
              onSignOut={handleSignOut}
              onToast={addToast}
            />
          </div>
        ) : (
          /* Authentication Screen: Split layout */
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Hero Branding Banner (5 columns on large screen) */}
              <div className="lg:col-span-5 flex">
                <HeroBranding />
              </div>

              {/* Right Column: Interactive Auth Card (7 columns on large screen) */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <AuthCard
                  onAuthSuccess={handleAuthSuccess}
                  onOpenForgotPassword={() => setIsForgotModalOpen(true)}
                  onToast={addToast}
                />
              </div>
            </div>

            {/* Bottom Flow 01 Step Tracker */}
            <div className="pt-4">
              <FlowStepsVisualizer currentStep={currentStep} />
            </div>
          </div>
        )}
      </main>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onSuccess={(email) => {
          addToast(
            "success",
            "Mật khẩu đã đặt lại",
            `Mật khẩu mới cho tài khoản ${email} đã được cập nhật thành công!`
          );
        }}
      />

      {/* Toast Notifications Container */}
      <ToastContainer notifications={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="py-6 border-t border-[#E0ECE9] dark:border-[#18423C] text-center text-xs text-[#486660] dark:text-[#8FAEA7]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 <strong>ExamApp</strong> • Nền tảng thi trắc nghiệm trực tuyến (Hóa - Sinh - Tiếng Anh)
          </span>
          <span className="font-medium text-[#0B8374] dark:text-[#CBE5DF]">
            Palette: Cam sáng (#F26B38) • Xanh mòng két (#0B8374) • Text (#CBE5DF)
          </span>
        </div>
      </footer>
    </div>
  );
}
