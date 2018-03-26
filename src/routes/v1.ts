import { Router } from 'express';
import { routes as authRoutes } from '../controllers/auth.controller';
import { routes as userRoutes } from '../controllers/user.controller';

export const routes: Router = Router({ mergeParams: true })
  .use('/auth', authRoutes)
  .use('/users', userRoutes);
