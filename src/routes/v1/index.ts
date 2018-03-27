import { Router } from 'express';
import { routes as authRoutes } from './auth.routes';
import { routes as userRoutes } from './user.routes';

export const routes: Router = Router({ mergeParams: true })
  .use('/auth', authRoutes)
  .use('/users', userRoutes);
