export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  status: UserStatus;
  role: UserRole;
  refreshToken?: string;
  resetPwToken?: string;
  createdAt: string;
  createdBy: string;
}

export interface UserCreate {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  status?: string;
  role: string; // Code of role
  resetPwToken?: string;
}

export interface UserUpdate {
  email: string;
  firstName: string;
  lastName: string;
  role: string; // Code of role
  status?: string; // code of status
}

export interface PartialUserUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  role?: string; // Code of role
  password?: string;
  resetPwToken?: string;
  refreshToken?: string;
}

export interface UserRole {
  name: string;
  code: string;
  description?: string;
  level: number;
}

export interface UserStatus {
  name: string;
  code: string;
  description?: string;
}
