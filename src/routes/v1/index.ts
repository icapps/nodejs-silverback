import { Router } from 'express';
import { routes as authRoutes } from './auth.routes';
import { routes as userRoutes } from './user.routes';
import { routes as metaRoutes } from './meta-options.routes';

export const routes: Router = Router({ mergeParams: true })
  .use('/auth', authRoutes)
  .use('/users', userRoutes)
  .use('/meta-options', metaRoutes);
