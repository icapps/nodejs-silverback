
import { Router } from 'express';
import { handleAsyncFn, validateSchema } from 'tree-house';
import { authSchema } from '../../schemes/auth.schema';
import * as controller from '../../controllers/auth.controller';

export const routes: Router = Router({ mergeParams: true })
  .post('/auth/login', validateSchema(authSchema.login), handleAsyncFn(controller.login))
  .post('/forgot-password/init', validateSchema(authSchema.forgotPwInit), handleAsyncFn(controller.initForgotPw));
