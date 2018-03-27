export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  hasAccess: boolean;
  role: string; // Code of role
}

export interface UserCreate {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  hasAccess: boolean;
  role: string; // Code of role
}
