export interface User {
  id: string;
  email: string;
  age: number;
  isAdult: boolean;
  createdAt?: string;
  updatedAt?: string;
  roles?: string[];
  avatarUrl?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  age: number;
}