export type UserRole = "student" | "teacher" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  className?: string; // For students: e.g. "12A1"
  assignedClasses?: string[]; // For teachers: e.g. ["10A1 - Hóa", "11B2 - Sinh"]
  token?: string;
}

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
}
