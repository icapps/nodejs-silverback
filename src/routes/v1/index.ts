import { Router } from 'express';
import { routes as authRoutes } from './auth.routes';
import { routes as userRoutes } from './user.routes';
import { routes as metaRoutes } from './meta.routes';
import { routes as configRoutes } from './config.routes';
import { routes as personalRoutes } from './personal.routes';

export const routes: Router = Router({ mergeParams: true })
  .use('', authRoutes)
  .use('/me', personalRoutes)
  .use('/config', configRoutes)
  .use('/users', userRoutes)
  .use('/meta', metaRoutes);
