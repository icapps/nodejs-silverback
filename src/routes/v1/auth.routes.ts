
import { Router } from 'express';
import { handleAsyncFn, validateSchema } from 'tree-house';
import { authSchema } from '../../schemes/auth.schema';
import * as controller from '../../controllers/auth.controller';

export const routes: Router = Router({ mergeParams: true })
  .post('/auth/login', validateSchema(authSchema.login), handleAsyncFn(controller.login))
  .post('/forgot-password/init', validateSchema(authSchema.forgotPwInit), handleAsyncFn(controller.initForgotPw))
  .get('/forgot-password/verify', validateSchema(authSchema.forgotPwVerify), handleAsyncFn(controller.verifyForgotPw))
  .put('/forgot-password/confirm', validateSchema(authSchema.forgotPwConfirm), handleAsyncFn(controller.confirmForgotPw));
