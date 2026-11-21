export type AdminRole = "super_admin" | "admin";

export interface Admin {
  id: number;
  full_name: string;
  username: string;
  phone: string | null;
  role: AdminRole;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminLoginInput {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
    token: string;
  };
}

export interface AdminsListResponse {
  success: boolean;
  count: number;
  data: Admin[];
}

export interface AdminSingleResponse {
  success: boolean;
  message?: string;
  data: Admin;
}

export interface CreateAdminInput {
  full_name: string;
  username: string;
  phone?: string;
  password: string;
  role: AdminRole;
  is_active?: boolean;
}

export interface UpdateAdminInput {
  full_name?: string;
  username?: string;
  phone?: string;
  password?: string;
  role?: AdminRole;
  is_active?: boolean;
}

export interface AdminFilters {
  search?: string;
  role?: string;
  is_active?: string;
}
