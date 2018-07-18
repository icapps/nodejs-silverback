export const roles = <Roles>{
  USER: {
    code: 'USER',
    name: 'User',
    description: 'roles:user', // i18n key
    level: 0,
  },
  ADMIN: {
    code: 'ADMIN',
    name: 'Admin',
    description: 'roles:admin', // i18n key
    level: 10,
  },
  SUPERUSER: {
    code: 'SUPER_USER',
    name: 'Superuser',
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
