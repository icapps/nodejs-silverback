export const jwtConfig = {
  algorithm: 'HS256',
  expiresIn: '7d',
  issuer: 'silverback',
  audience: 'SILVERBACK',
  secretOrKey: process.env.JWT_SECRET || 'mySecret',
};

// TODO: Find more clean way to generate secret/keys for multiple hashing purposes
export const tokenConfig = {
  secretOrKey: process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_token` : 'myTokenSecret',
};
