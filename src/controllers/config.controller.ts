import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { responder } from '../lib/responder';
import { appVersionSerializer, apiVersionSerializer } from '../serializers/config.serializer';
import { settings } from '../config/app.config';

/**
 * Return the minimum and latest version for a specific os (android/ios)
 */
// TODO: Update Swagger (will return meta data)
export function getAppVersion(req: Request, res: Response) {
  const os: string = req.params.os;
  const data = {
    minVersion: process.env[`MIN_VERSION_${os.toUpperCase()}`],
    latestVersion: process.env[`LATEST_VERSION_${os.toUpperCase()}`],
  };

  responder.success(res, {
    status: httpStatus.OK,
    payload: data,
    serializer: appVersionSerializer,
  });
}


/**
 * Returns the current build and version number of the api
 */
// TODO: Add to Swagger
export function getApiVersion(_req: Request, res: Response) {
  const data = {
    build: process.env.BUILD_NUMBER,
    version: settings.version,
  };

  responder.success(res, {
    status: httpStatus.OK,
    payload: data,
    serializer: apiVersionSerializer,
  });
}
