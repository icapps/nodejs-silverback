import * as uuid from 'uuid';
import { SessionOptions } from 'express-session';
import { getRedisSessionStore } from '../lib/memory-store';
import { envs } from '../constants';

// Jwt authentication
export const jwtConfig = {
  algorithm: 'HS256',
  expiresIn: '7d',
  issuer: 'silverback',
  audience: 'SILVERBACK',
  secretOrKey: process.env.JWT_SECRET || 'mySecret',
};

// Session authentication
export const sessionConfig: SessionOptions = {
  name: 'connect.silverback',
  secret: process.env.SESSION_SECRET || 'mySecret',
  resave: false, // true = Resave the token on every request (must be true when maxAge and rolling=true)
  saveUninitialized: false, // true = Save not modified session tokens
  cookie: {
    secure: process.env.NODE_ENV === envs.PRODUCTION, // Turn secure cookies off during tests
    // maxAge: 30000, // Maximum time in milliseconds to be active
    httpOnly: true,
  },
  rolling: false, // true = reset maxAge property on every request (not used at the moment)
  unset: 'destroy', // Make sure to delete records from store after destroyed
  store: process.env.NODE_ENV === envs.DEVELOP ? undefined : getRedisSessionStore(), // Use our existing Redis client (in staging/production)
  genid: _req => uuid.v1(), // Generate id's
};
