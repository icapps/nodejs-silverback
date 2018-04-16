import { Request } from 'express';
import { User } from './user.model';

export interface AuthRequest extends Request {
  session: {
    user: User;
  };
}
