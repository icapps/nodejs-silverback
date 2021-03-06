export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  status: UserStatus;
  role: UserRole;
  resetPwToken?: string;
  registrationConfirmed: boolean;
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
  registrationConfirmed: boolean;
}

export interface UserUpdate {
  email: string;
  firstName: string;
  lastName: string;
  role: string; // Code of role
  status?: string; // code of status
  registrationConfirmed?: boolean;
}

export interface PartialUserUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  role?: string; // Code of role
  password?: string;
  resetPwToken?: string;
  registrationConfirmed?: boolean;
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
