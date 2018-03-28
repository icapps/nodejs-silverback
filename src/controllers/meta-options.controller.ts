import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { responder } from '../lib/responder';
import { codeTypeSerializer, codeSerializer } from '../serializers/meta-options.serializer';
import * as metaOptionsService from '../services/meta-options.service';


/**
 * Return all codeTypes
 */
export async function findAllCodeTypes(req: Request, res: Response): Promise<void> {
  const { data, totalCount } = await metaOptionsService.findAllCodeTypes(req.query);
  responder.succes(res, {
    totalCount,
    status: httpStatus.OK,
    payload: data,
    serializer: codeTypeSerializer,
  });
}

/**
 * Return all codes
 */
export async function findAllCodes(req: Request, res: Response): Promise<void> {
  const { data, totalCount } = await metaOptionsService.findAllCodes(req.query);
  responder.succes(res, {
    totalCount,
    status: httpStatus.OK,
    payload: data,
    serializer: codeSerializer,
  });
}
