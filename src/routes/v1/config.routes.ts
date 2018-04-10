
import { Router } from 'express';
import { handleAsyncFn, validateSchema } from 'tree-house';
import { configSchema } from '../../schemes/config.schema';
import * as controller from '../../controllers/config.controller';

export const routes: Router = Router({ mergeParams: true })
  .get('/version', handleAsyncFn(controller.getApiVersion))
  .get('/version/:os', validateSchema(configSchema.appVersion), handleAsyncFn(controller.getAppVersion));
