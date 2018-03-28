export const VERSIONS = {
  'Version 1': '/v1',
};

export const settings = {
  saltCount: parseInt(process.env.SALT_COUNT || '10', 10),
};

export const mailSettings = {
  systemEmail: process.env.SYSTEM_EMAIL || 'info@icapps.com',
};



