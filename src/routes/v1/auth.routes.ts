
import { Router } from 'express';
import { handleAsyncFn } from 'tree-house';
import { validateSchema } from '../../lib/validator';
import { authSchema } from '../../schemes/auth.schema';
import * as controller from '../../controllers/auth.controller';

export const routes: Router = Router({ mergeParams: true })
  .post('/login', validateSchema(authSchema.login), handleAsyncFn(controller.login));

