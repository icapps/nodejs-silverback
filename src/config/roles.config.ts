export const roles = <Roles>{
  USER: {
    code: 'USER',
    name: 'user',
    description: 'roles:user', // i18n key
    level: 0,
  },
  ADMIN: {
    code: 'ADMIN',
    name: 'admin',
    description: 'roles:admin', // i18n key
    level: 10,
  },
  SUPERUSER: {
    code: 'SUPER_USER',
    name: 'superuser',
    description: 'roles:superuser', // i18n key
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
