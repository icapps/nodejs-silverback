export const roles = <Roles>{
  USER: {
    code: 'USER',
    name: 'user',
    description: '', // i18n ?
    level: 0,
  },
  ADMIN: {
    code: 'ADMIN',
    name: 'admin',
    description: '', // i18n?
    level: 10,
  },
  SUPERUSER: {
    code: 'SUPER_USER',
    name: 'superuser',
    description: '', // i18n?
    level: 999,
  },
};

// Interfaces
export interface Roles {
  [key: string]: Role;
}

export interface Role {
  code: string;
  name: string;
  level: number;
  description?: string;
}
