"use client";

import React from "react";
import {
  GraduationCap,
  Sparkles,
  Bot,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Award,
} from "lucide-react";

export const HeroBranding: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0B8374] via-[#08665A] to-[#054038] text-white relative overflow-hidden shadow-2xl">
      {/* Decorative Background Circles */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#F26B38]/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#0B8374]/30 blur-3xl pointer-events-none" />

      {/* Top Tag & Slogan */}
      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
          <GraduationCap className="w-4 h-4 text-[#F26B38]" />
          <span>Hệ Thống Khảo Thí & Tự Học Trực Tuyến</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
          Thi Trắc Nghiệm <br />
          <span className="text-[#F26B38] drop-shadow-sm">3 Môn Trọng Điểm</span>
        </h1>

        <p className="text-sm sm:text-base text-[#CBE5DF] leading-relaxed max-w-lg">
          Nền tảng thi chuẩn hóa tích hợp công nghệ AI cho <strong>Hóa học</strong>,{" "}
          <strong>Sinh học</strong> và <strong>Tiếng Anh</strong>. Hỗ trợ câu hỏi nhiều đáp án đúng,
          công thức LaTeX và phân tích kết quả trực quan.
        </p>

        {/* 3 Subjects Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F0F7F5]">
            🧪 Hóa Học (LaTeX & PTPƯ)
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F0F7F5]">
            🧬 Sinh Học (Di Truyền & Menđen)
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F0F7F5]">
            🇬🇧 Tiếng Anh (IPA & Grammar)
          </span>
        </div>
      </div>

      {/* Middle Feature Highlights Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-8">
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition">
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#F26B38] text-white">
              <Clock className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-sm text-white">Chế Độ Thi Thật</h4>
          </div>
          <p className="text-xs text-[#CBE5DF] leading-relaxed">
            Đếm ngược thời gian thực, tự động thu bài khi hết giờ (00:00) & chống gian lận.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition">
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#0B8374] text-white">
              <Bot className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-sm text-white">Thi Thử + AI Chatbot</h4>
          </div>
          <p className="text-xs text-[#CBE5DF] leading-relaxed">
            Phản hồi đúng/sai tức thì (Xanh/Đỏ) và tương tác với AI để hiểu sâu bản chất.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition">
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-1.5 rounded-lg bg-emerald-500 text-white">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-sm text-white">Xóa Mềm (Soft Delete)</h4>
          </div>
          <p className="text-xs text-[#CBE5DF] leading-relaxed">
            Học sinh tự ẩn lịch sử cá nhân mà vẫn bảo lưu 100% dữ liệu gốc cho nhà trường.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition">
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-1.5 rounded-lg bg-amber-500 text-white">
              <Award className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-sm text-white">Xếp Hạng & Báo Cáo</h4>
          </div>
          <p className="text-xs text-[#CBE5DF] leading-relaxed">
            Top 10/20/50 tùy biến, dashboard đánh giá giáo viên và xuất Excel/PDF chuẩn.
          </p>
        </div>
      </div>

      {/* Bottom Trust Badge */}
      <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-[#CBE5DF]">
        <span className="flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#F26B38]" />
          Chuẩn Thang Điểm 10 Quốc Gia
        </span>
        <span className="font-mono text-[11px] text-white/70">Google OAuth 2.0 Ready</span>
      </div>
    </div>
  );
};
