export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  countryCode: string;
  mobileNumber: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface SignupData {
  fullName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  password: string;
  username?: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

export interface UpdateProfileData {
  fullName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  username?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
