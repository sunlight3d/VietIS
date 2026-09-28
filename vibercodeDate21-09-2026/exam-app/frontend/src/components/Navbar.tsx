"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Sparkles, BookOpen, GraduationCap } from "lucide-react";
import { UserProfile } from "@/types";

interface NavbarProps {
  currentUser: UserProfile | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onSignOut }) => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const isDarkCurrent = document.documentElement.classList.contains("dark");
    setIsDark(isDarkCurrent);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-[#071513]/85 border-b border-[#E0ECE9] dark:border-[#18423C] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B8374] to-[#F26B38] flex items-center justify-center shadow-md shadow-[#0B8374]/20 text-white font-black text-xl tracking-tight">
            E
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-[#0B8374] dark:text-[#CBE5DF]">
                Exam<span className="text-[#F26B38]">App</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F5F2] dark:bg-[#13322E] text-[#0B8374] dark:text-[#CBE5DF] border border-[#0B8374]/20">
                <Sparkles className="w-3 h-3 mr-1 text-[#F26B38]" /> Flow 01
              </span>
            </div>
            <p className="hidden md:block text-[11px] font-medium text-[#486660] dark:text-[#8FAEA7]">
              Hệ thống thi trắc nghiệm trực tuyến: Hóa • Sinh • Tiếng Anh
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-[#E6F5F2] dark:bg-[#0E2421] border border-[#0B8374]/30 rounded-full px-3 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#0B8374] animate-ping" />
              <span className="font-semibold text-[#0F2825] dark:text-[#F0F7F5]">
                {currentUser.name}
              </span>
              <span className="px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-[#F26B38] text-white">
                {currentUser.role === "student" ? "Học viên" : currentUser.role === "teacher" ? "Giáo viên" : "Admin"}
              </span>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="ml-1 text-[11px] font-semibold text-[#F26B38] hover:underline"
                >
                  Đăng xuất
                </button>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-2 text-xs font-medium text-[#486660] dark:text-[#CBE5DF]">
              <span className="flex items-center px-2.5 py-1 rounded-lg bg-[#E6F5F2] dark:bg-[#13322E] text-[#0B8374] dark:text-[#CBE5DF]">
                <GraduationCap className="w-3.5 h-3.5 mr-1 text-[#0B8374]" /> 3 Môn: Hóa - Sinh - Anh
              </span>
              <span className="flex items-center px-2.5 py-1 rounded-lg bg-[#FFEDE5] dark:bg-[#281812] text-[#F26B38]">
                <BookOpen className="w-3.5 h-3.5 mr-1" /> Ngân hàng 20 câu ngẫu nhiên
              </span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
            className="p-2.5 rounded-xl border border-[#E0ECE9] dark:border-[#18423C] bg-white dark:bg-[#0D2522] text-[#0F2825] dark:text-[#CBE5DF] hover:bg-[#E6F5F2] dark:hover:bg-[#13322E] transition-all shadow-sm active:scale-95"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#F26B38]" />
            ) : (
              <Moon className="w-4 h-4 text-[#0B8374]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
