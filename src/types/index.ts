export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
};

export type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

export type AppRole = "ADMIN" | "CLIENTE" | "MEDICO";
export type AppUserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type AppScheduleStatus = "ACTIVE" | "CANCELLED";

export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  status: AppUserStatus;
  profileUrl?: string;  // URL de la imagen de perfil
  createdAt: string;
  updatedAt: string;
};

export type ScheduleDto = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: AppScheduleStatus;
  userId: string;
};
