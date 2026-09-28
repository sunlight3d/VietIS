"use client";

import React from "react";
import { CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

interface FlowStepsVisualizerProps {
  currentStep: number; // 1 to 5
}

const FLOW_STEPS = [
  {
    step: 1,
    title: "Truy cập ứng dụng",
    desc: "Khởi tạo cổng xác thực Exam-App",
    actor: "Người dùng",
  },
  {
    step: 2,
    title: "Lựa chọn phương thức",
    desc: "Đăng nhập Google hoặc nhập Email/Mật khẩu",
    actor: "Người dùng",
  },
  {
    step: 3,
    title: "Phân lớp & Nhập liệu",
    desc: "Gắn lớp học sinh & mã hóa bảo mật",
    actor: "Thí sinh & Hệ thống",
  },
  {
    step: 4,
    title: "Xác thực phiên (JWT)",
    desc: "Cấp token phiên làm việc an toàn",
    actor: "Hệ thống",
  },
  {
    step: 5,
    title: "Điều hướng theo vai trò",
    desc: "Vào phòng thi (HV) hoặc Quản lý (GV/Admin)",
    actor: "Hệ thống",
  },
];

export const FlowStepsVisualizer: React.FC<FlowStepsVisualizerProps> = ({ currentStep }) => {
  return (
    <div className="w-full bg-white/70 dark:bg-[#0D2522]/70 backdrop-blur-xl border border-[#E0ECE9] dark:border-[#18423C] rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E0ECE9] dark:border-[#18423C]">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-lg bg-[#E6F5F2] dark:bg-[#13322E] text-[#0B8374] flex items-center justify-center text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#F26B38]" />
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-[#0F2825] dark:text-[#F0F7F5] uppercase tracking-wider">
            Tiến trình nghiệp vụ (Flow 01 Workflow Tracking)
          </h4>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFEDE5] dark:bg-[#281812] text-[#F26B38]">
          Bước {currentStep} / 5
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {FLOW_STEPS.map((s) => {
          const isDone = s.step < currentStep;
          const isActive = s.step === currentStep;

          return (
            <div
              key={s.step}
              className={`relative p-3 rounded-2xl border transition-all duration-300 ${
                isActive
                  ? "bg-[#FFEDE5]/50 dark:bg-[#281812]/50 border-[#F26B38] shadow-md shadow-[#F26B38]/10 ring-1 ring-[#F26B38]"
                  : isDone
                  ? "bg-[#E6F5F2]/50 dark:bg-[#0E2421]/50 border-[#0B8374]/30"
                  : "bg-[#F7FAF9] dark:bg-[#071513] border-[#E0ECE9] dark:border-[#18423C] opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                    isActive
                      ? "bg-[#F26B38] text-white shadow"
                      : isDone
                      ? "bg-[#0B8374] text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.step}
                </span>
                <span className="text-[10px] font-medium text-[#486660] dark:text-[#CBE5DF]">
                  {s.actor}
                </span>
              </div>
              <h5 className="font-bold text-xs text-[#0F2825] dark:text-[#F0F7F5] truncate">
                {s.title}
              </h5>
              <p className="text-[10px] text-[#486660] dark:text-[#8FAEA7] mt-0.5 line-clamp-2 leading-tight">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
