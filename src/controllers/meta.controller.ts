import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { responder } from '../lib/responder';
import { codeSerializer } from '../serializers/meta.serializer';
import * as metaService from '../services/meta.service';
import { AuthRequest } from '../models/request.model';
import { Filters } from '../models/filters.model';


/**
 * Return all codes for a specific code type
 */
export async function findAllCodes(req: AuthRequest, res: Response, showDeprecated?: boolean): Promise<void> {
  const codeType = req.params.codeType;

  // if deprecated codes are requested add them to filters object
  const filters: Filters = Object.assign({}, req.query, { showDeprecated });

  const { data, totalCount } = await metaService.findAllCodes(codeType, filters);
  responder.success(res, {
    totalCount,
    status: httpStatus.OK,
    payload: data,
    serializer: codeSerializer,
  });
}


/**
 * Create a new code
 */
export async function createCode(req: Request, res: Response): Promise<void> {
  const codeType = req.params.codeType;
  const result = await metaService.createCode(codeType, req.body);
  responder.success(res, {
    status: httpStatus.CREATED,
    payload: result,
    serializer: codeSerializer,
  });
}


/**
 * Deprecate an existing code
 */
export async function deprecateCode(req: Request, res: Response): Promise<void> {
  await metaService.deprecateCode(req.params.codeId);
  responder.success(res, {
    status: httpStatus.OK,
  });
}
