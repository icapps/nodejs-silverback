
import { Router } from 'express';
import { handleAsyncFn, validateSchema } from 'tree-house';
import { authSchema } from '../../schemes/auth.schema';
import { setGlobalBruteforce, setUserBruteForce } from '../../middleware/bruteforce.middleware';
import { hasPermission } from '../../middleware/permission.middleware';
import * as controller from '../../controllers/auth.controller';

export const routes: Router = Router({ mergeParams: true })
  .post('/auth/login',
    setGlobalBruteforce,
    setUserBruteForce,
    validateSchema(authSchema.login),
    handleAsyncFn(controller.login))

  .post('/auth/refresh',
    validateSchema(authSchema.refresh),
    handleAsyncFn(controller.refresh))

  .post('/auth/logout', (req, res, next) =>
    hasPermission(req, res, next),
    handleAsyncFn(controller.logout))

  .post('/forgot-password/init',
    validateSchema(authSchema.forgotPwInit),
    handleAsyncFn(controller.initForgotPw))

  .get('/forgot-password/verify',
    validateSchema(authSchema.forgotPwVerify),
    handleAsyncFn(controller.verifyForgotPw))

  .put('/forgot-password/confirm',
    validateSchema(authSchema.forgotPwConfirm),
    handleAsyncFn(controller.confirmForgotPw));
