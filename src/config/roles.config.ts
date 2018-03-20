export const roles = <Roles>{
  USER: {
    code: 'USER',
    description: '', // i18n ?
    level: 0,
  },
  ADMIN: {
    code: 'ADMIN',
    description: '', // i18n?
    level: 10,
  },
  SUPERUSER: {
    code: 'SUPER_USER',
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
  level: number;
  description?: string;
}
