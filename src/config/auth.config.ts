export const jwtConfig = {
  algorithm: 'HS256',
  expiresIn: '7d',
  issuer: 'silverback',
  audience: 'SILVERBACK',
  secretOrKey: process.env.JWT_SECRET,
};
