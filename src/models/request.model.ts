import { Request } from 'express';
import { User } from './user.model';

export interface AuthRequest extends Request {
  current: {
    user: User;
  };
}

export interface BruteRequest extends Request {
  brute: {
    reset: (fn: Function) => {};
  };
}
