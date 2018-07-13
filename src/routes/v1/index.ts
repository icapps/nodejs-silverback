import { Router } from 'express';
import { routes as authRoutes } from './auth.routes';
import { routes as userRoutes } from './user.routes';
import { routes as metaRoutes } from './meta.routes';
import { routes as configRoutes } from './config.routes';
import { routes as personalRoutes } from './personal.routes';
import { checkUserStatus } from '../../middleware/userStatus.middleware';

export const routes: Router = Router({ mergeParams: true })
  .use('', authRoutes)
  .use('/me', checkUserStatus, personalRoutes)
  .use('/config', configRoutes)
  .use('/users', checkUserStatus, userRoutes)
  .use('/meta', checkUserStatus, metaRoutes);
