import { Router } from 'express';
import { routes as userRoutes } from '../controllers/user.controller';

export const routes: Router = Router({ mergeParams: true })
  .use('/users', userRoutes);
