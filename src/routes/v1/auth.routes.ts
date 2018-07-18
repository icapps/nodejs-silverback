
import { Router } from 'express';
import { handleAsyncFn, validateSchema } from 'tree-house';
import { authSchema } from '../../schemes/auth.schema';
import { setGlobalBruteforce, setUserBruteForce } from '../../middleware/bruteforce.middleware';
import { hasPermission } from '../../middleware/permission.middleware';
import { BruteRequest } from '../../models/request.model';
import { roles } from '../../config/roles.config';
import * as controller from '../../controllers/auth.controller';

export const routes: Router = Router({ mergeParams: true })
  // Application(s)
  .post('/auth/login',
    setGlobalBruteforce,
    setUserBruteForce,
    validateSchema(authSchema.login),
    handleAsyncFn((req: BruteRequest, res) => controller.login(req, res)))

  // Administraion panel
  .post('/auth/login/admin',
    setGlobalBruteforce,
    setUserBruteForce,
    validateSchema(authSchema.login),
    handleAsyncFn((req: BruteRequest, res) => controller.login(req, res, roles.ADMIN)))

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
