export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  fullName: string;
  role: 'Admin' | 'Employee' | 'Developer' | string;
}

export interface AuthUser {
  id?: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'Employee' | 'Developer' | string;
}
