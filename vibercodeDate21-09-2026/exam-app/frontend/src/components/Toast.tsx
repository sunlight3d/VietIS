"use client";

import React from "react";
import { ToastNotification } from "@/types";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

interface ToastProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {notifications.map((item) => {
        const iconMap = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-[#0B8374] flex-shrink-0" />,
        };

        const borderMap = {
          success: "border-emerald-500/30 bg-emerald-50/95 dark:bg-[#071F1A]/95",
          error: "border-red-500/30 bg-red-50/95 dark:bg-[#200A0A]/95",
          warning: "border-amber-500/30 bg-amber-50/95 dark:bg-[#201507]/95",
          info: "border-[#0B8374]/30 bg-[#E6F5F2]/95 dark:bg-[#0E2421]/95",
        };

        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-slide-up ${
              borderMap[item.type]
            }`}
          >
            <div className="flex items-start space-x-3">
              {iconMap[item.type]}
              <div>
                <h4 className="text-xs font-bold text-[#0F2825] dark:text-[#F0F7F5]">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#486660] dark:text-[#CBE5DF] mt-0.5 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDismiss(item.id)}
              className="ml-3 text-[#486660] dark:text-[#CBE5DF] hover:text-[#0F2825] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
