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
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === envs.PRODUCTION, // Turn secure cookies off during tests
    httpOnly: true,
  },
  rolling: true,
  unset: 'destroy',
  store: process.env.NODE_ENV === envs.DEVELOP ? undefined : getRedisSessionStore(), // Use our existing Redis client (in staging/production)
  genid: _req => uuid.v1(), // Generate id's
};
