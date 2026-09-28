"use client";

import React from "react";
import { UserProfile } from "@/types";
import {
  GraduationCap,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  FileSpreadsheet,
  FileText,
  Users,
  Settings,
  ShieldCheck,
  BarChart3,
  LogOut,
} from "lucide-react";

interface RoleDashboardPreviewProps {
  user: UserProfile;
  onSignOut: () => void;
  onToast: (type: "info" | "success", title: string, message: string) => void;
}

export const RoleDashboardPreview: React.FC<RoleDashboardPreviewProps> = ({
  user,
  onSignOut,
  onToast,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B8374] via-[#08665A] to-[#F26B38] text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider">
              <span>Mô phỏng Giao diện Sau Xác Thực (Flow 01 - Bước 5)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Xin chào, {user.name}!
            </h2>
            <p className="text-xs sm:text-sm text-[#CBE5DF]">
              {user.role === "student" && `Tài khoản Thí sinh • Lớp ${user.className || "12A1"} • Đã cấp quyền phòng thi`}
              {user.role === "teacher" && `Tài khoản Giáo viên • Phụ trách ${user.assignedClasses?.join(", ") || "10A1 - Hóa"} • Đã cấp quyền quản lý lớp`}
              {user.role === "admin" && "Tài khoản Quản trị viên Tối cao • Toàn quyền điều hành hệ thống"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onSignOut}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white text-xs font-bold transition flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất (Quay lại Form)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role-Specific Content */}
      {user.role === "student" && (
        <div className="space-y-6">
          {/* Quick Notice */}
          <div className="p-4 rounded-2xl bg-[#E6F5F2] dark:bg-[#0D2522] border border-[#0B8374]/30 text-xs text-[#0B8374] dark:text-[#CBE5DF] flex items-center justify-between">
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-[#0B8374]" />
              <strong>Xác thực thành công:</strong> Mỗi bài thi sẽ được rút ngẫu nhiên 20 câu theo quy định của trường.
            </span>
            <span className="font-bold text-[#F26B38]">Niên khóa 2026-2027</span>
          </div>

          {/* Subjects Selection */}
          <div>
            <h3 className="text-base font-bold text-[#0F2825] dark:text-[#F0F7F5] mb-3 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-[#0B8374]" />
              Chọn Môn Thi Trắc Nghiệm (3 Môn Trọng Điểm)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chemistry */}
              <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-5 shadow-sm hover:border-[#0B8374] transition group">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-[#E6F5F2] dark:bg-[#13322E] text-[#0B8374] flex items-center justify-center font-bold text-lg">
                    🧪
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F5F2] text-[#0B8374]">
                    20 Câu
                  </span>
                </div>
                <h4 className="font-bold text-[#0F2825] dark:text-[#F0F7F5] text-base group-hover:text-[#0B8374] transition">
                  Môn Hóa Học
                </h4>
                <p className="text-xs text-[#486660] dark:text-[#8FAEA7] mt-1 mb-4">
                  Phương trình phản ứng, chỉ số hóa học, muối và kim loại lưỡng tính.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E0ECE9] dark:border-[#18423C]">
                  <button
                    onClick={() => onToast("info", "Phòng Thi Thật", "Tính năng thi thật đang được kết nối với Flow 04")}
                    className="py-1.5 px-2 rounded-lg bg-[#FFEDE5] dark:bg-[#281812] text-[#F26B38] text-[11px] font-bold flex items-center justify-center space-x-1 hover:bg-[#F26B38] hover:text-white transition"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Thi Thật</span>
                  </button>
                  <button
                    onClick={() => onToast("info", "Phòng Thi Thử", "Tính năng thi thử đang được kết nối với Flow 03")}
                    className="py-1.5 px-2 rounded-lg bg-[#E6F5F2] dark:bg-[#13322E] text-[#0B8374] text-[11px] font-bold flex items-center justify-center space-x-1 hover:bg-[#0B8374] hover:text-white transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Thi Thử AI</span>
                  </button>
                </div>
              </div>

              {/* Biology */}
              <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-5 shadow-sm hover:border-[#0B8374] transition group">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-[#E6F5F2] dark:bg-[#13322E] text-[#0B8374] flex items-center justify-center font-bold text-lg">
                    🧬
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F5F2] text-[#0B8374]">
                    20 Câu
                  </span>
                </div>
                <h4 className="font-bold text-[#0F2825] dark:text-[#F0F7F5] text-base group-hover:text-[#0B8374] transition">
                  Môn Sinh Học
                </h4>
                <p className="text-xs text-[#486660] dark:text-[#8FAEA7] mt-1 mb-4">
                  Di truyền học Menđen, phép lai AaBb, biến dị tổ hợp và sinh thái học.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E0ECE9] dark:border-[#18423C]">
                  <button
                    onClick={() => onToast("info", "Phòng Thi Thật", "Tính năng thi thật đang được kết nối với Flow 04")}
                    className="py-1.5 px-2 rounded-lg bg-[#FFEDE5] dark:bg-[#281812] text-[#F26B38] text-[11px] font-bold flex items-center justify-center space-x-1 hover:bg-[#F26B38] hover:text-white transition"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Thi Thật</span>
                  </button>
                  <button
                    onClick={() => onToast("info", "Phòng Thi Thử", "Tính năng thi thử đang được kết nối với Flow 03")}
                    className="py-1.5 px-2 rounded-lg bg-[#E6F5F2] dark:bg-[#13322E] text-[#0B8374] text-[11px] font-bold flex items-center justify-center space-x-1 hover:bg-[#0B8374] hover:text-white transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Thi Thử AI</span>
                  </button>
                </div>
              </div>

              {/* English */}
              <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-5 shadow-sm hover:border-[#0B8374] transition group">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-[#E6F5F2] dark:bg-[#13322E] text-[#0B8374] flex items-center justify-center font-bold text-lg">
                    🇬🇧
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F5F2] text-[#0B8374]">
                    20 Câu
                  </span>
                </div>
                <h4 className="font-bold text-[#0F2825] dark:text-[#F0F7F5] text-base group-hover:text-[#0B8374] transition">
                  Môn Tiếng Anh
                </h4>
                <p className="text-xs text-[#486660] dark:text-[#8FAEA7] mt-1 mb-4">
                  Phát âm chuẩn IPA, ngữ pháp câu điều kiện, từ vựng và đọc hiểu chuyên sâu.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E0ECE9] dark:border-[#18423C]">
                  <button
                    onClick={() => onToast("info", "Phòng Thi Thật", "Tính năng thi thật đang được kết nối với Flow 04")}
                    className="py-1.5 px-2 rounded-lg bg-[#FFEDE5] dark:bg-[#281812] text-[#F26B38] text-[11px] font-bold flex items-center justify-center space-x-1 hover:bg-[#F26B38] hover:text-white transition"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Thi Thật</span>
                  </button>
                  <button
                    onClick={() => onToast("info", "Phòng Thi Thử", "Tính năng thi thử đang được kết nối với Flow 03")}
                    className="py-1.5 px-2 rounded-lg bg-[#E6F5F2] dark:bg-[#13322E] text-[#0B8374] text-[11px] font-bold flex items-center justify-center space-x-1 hover:bg-[#0B8374] hover:text-white transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Thi Thử AI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Exam History Indicator (Xanh - Đỏ) */}
          <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F2825] dark:text-[#F0F7F5] flex items-center">
                <Clock className="w-4 h-4 mr-2 text-[#F26B38]" />
                Lịch Sử Làm Bài Gần Đây (Mã màu Xanh Đạt / Đỏ Chưa Đạt)
              </h3>
              <span className="text-xs text-[#486660] dark:text-[#8FAEA7]">
                Theo Flow 02: Xóa mềm & Nhận diện màu
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Passed Exam */}
              <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                        Đề Thi Thật Môn Hóa Học #01
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                        ĐẠT (PASS)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Điểm: 8.5 / 10 • Đúng 17/20 câu • Xếp loại GIỎI
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500">2 ngày trước</span>
              </div>

              {/* Failed Exam */}
              <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-50/60 dark:bg-red-950/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold text-xs">
                    ✕
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                        Đề Thi Thử Môn Sinh Học #02
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                        CHƯA ĐẠT (FAIL)
                      </span>
                    </div>
                    <span className="text-[11px] text-red-700 dark:text-red-400">
                      Điểm: 4.0 / 10 • Đúng 8/20 câu • Cần ôn luyện thêm
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500">Hôm qua</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {user.role === "teacher" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-[#486660] dark:text-[#8FAEA7] font-semibold">Lớp Phụ Trách</span>
              <p className="text-2xl font-black text-[#0B8374] mt-1">2 Lớp (10A1, 11B2)</p>
            </div>
            <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-[#486660] dark:text-[#8FAEA7] font-semibold">Tổng Học Sinh</span>
              <p className="text-2xl font-black text-[#F26B38] mt-1">84 Học sinh</p>
            </div>
            <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-[#486660] dark:text-[#8FAEA7] font-semibold">Tỷ Lệ Đạt (Pass)</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">89.2%</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-[#0F2825] dark:text-[#F0F7F5] text-base">
              Công Cụ Báo Cáo Giáo Viên Bộ Môn
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onToast("success", "Xuất Excel", "Đang trích xuất dữ liệu bảng điểm lớp 10A1 sang file .xlsx")}
                className="px-4 py-2.5 rounded-xl bg-[#0B8374] text-white font-bold text-xs hover:bg-[#08665A] transition flex items-center space-x-2 shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Xuất Báo Cáo Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => onToast("success", "Xuất PDF", "Đang kết xuất bảng điểm trang in PDF chuẩn sư phạm")}
                className="px-4 py-2.5 rounded-xl bg-[#F26B38] text-white font-bold text-xs hover:bg-[#D95423] transition flex items-center space-x-2 shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Xuất Báo Cáo PDF (.pdf)</span>
              </button>
              <button
                onClick={() => onToast("info", "Đóng góp câu hỏi", "Mở trình soạn thảo câu hỏi chờ Admin duyệt")}
                className="px-4 py-2.5 rounded-xl border border-[#0B8374] text-[#0B8374] dark:text-[#CBE5DF] font-bold text-xs hover:bg-[#E6F5F2] dark:hover:bg-[#13322E] transition flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Đóng Góp Câu Hỏi Mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {user.role === "admin" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-[#486660] dark:text-[#8FAEA7] font-semibold">Kho Câu Hỏi</span>
              <p className="text-2xl font-black text-[#0B8374] mt-1">1,250 Câu</p>
            </div>
            <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-[#486660] dark:text-[#8FAEA7] font-semibold">Chờ Duyệt (GV)</span>
              <p className="text-2xl font-black text-[#F26B38] mt-1">15 Câu</p>
            </div>
            <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-[#486660] dark:text-[#8FAEA7] font-semibold">Tổng Số Lớp</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">12 Lớp</p>
            </div>
            <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-[#486660] dark:text-[#8FAEA7] font-semibold">Lượt Thi Đã Nộp</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">3,420 Lượt</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D2522] border border-[#E0ECE9] dark:border-[#18423C] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-[#0F2825] dark:text-[#F0F7F5] text-base">
              Lối Tắt Quản Trị Hệ Thống (Admin Shortcuts)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => onToast("info", "Cấu hình đề thi", "Tùy biến số câu hỏi, thời gian làm bài")}
                className="p-3.5 rounded-xl border border-[#E0ECE9] dark:border-[#18423C] hover:border-[#0B8374] text-left transition bg-[#F7FAF9] dark:bg-[#071513]"
              >
                <Settings className="w-5 h-5 text-[#0B8374] mb-2" />
                <span className="block font-bold text-xs text-[#0F2825] dark:text-[#F0F7F5]">Cấu Hình Đề Thi</span>
                <span className="text-[11px] text-[#486660] dark:text-[#8FAEA7]">Tùy chỉnh số câu & thời gian</span>
              </button>

              <button
                onClick={() => onToast("info", "Phân lớp học sinh", "Tạo lớp, chuyển lớp, phân công GV")}
                className="p-3.5 rounded-xl border border-[#E0ECE9] dark:border-[#18423C] hover:border-[#0B8374] text-left transition bg-[#F7FAF9] dark:bg-[#071513]"
              >
                <Users className="w-5 h-5 text-[#0B8374] mb-2" />
                <span className="block font-bold text-xs text-[#0F2825] dark:text-[#F0F7F5]">Quản Lý Lớp Học</span>
                <span className="text-[11px] text-[#486660] dark:text-[#8FAEA7]">Phân bổ & chuyển lớp học sinh</span>
              </button>

              <button
                onClick={() => onToast("info", "Kiểm duyệt câu hỏi", "Phê duyệt hoặc từ chối câu hỏi của giáo viên")}
                className="p-3.5 rounded-xl border border-[#E0ECE9] dark:border-[#18423C] hover:border-[#F26B38] text-left transition bg-[#F7FAF9] dark:bg-[#071513]"
              >
                <ShieldCheck className="w-5 h-5 text-[#F26B38] mb-2" />
                <span className="block font-bold text-xs text-[#0F2825] dark:text-[#F0F7F5]">Duyệt Câu Hỏi (15)</span>
                <span className="text-[11px] text-[#486660] dark:text-[#8FAEA7]">Thẩm định câu hỏi giáo viên</span>
              </button>

              <button
                onClick={() => onToast("info", "Dashboard toàn trường", "Bảng xếp hạng Top & Đánh giá giáo viên")}
                className="p-3.5 rounded-xl border border-[#E0ECE9] dark:border-[#18423C] hover:border-[#F26B38] text-left transition bg-[#F7FAF9] dark:bg-[#071513]"
              >
                <BarChart3 className="w-5 h-5 text-[#F26B38] mb-2" />
                <span className="block font-bold text-xs text-[#0F2825] dark:text-[#F0F7F5]">Dashboard Thống Kê</span>
                <span className="text-[11px] text-[#486660] dark:text-[#8FAEA7]">Top điểm & đánh giá lớp/GV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
