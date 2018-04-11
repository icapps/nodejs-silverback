import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { responder } from '../lib/responder';
import { codeSerializer } from '../serializers/meta.serializer';
import * as metaService from '../services/meta.service';



/**
 * Return all codes for a specific code type
 */
export async function findAllCodes(req: Request, res: Response): Promise<void> {
  const codeType = req.params.codeType;
  const { data, totalCount } = await metaService.findAllCodes(codeType, req.query);
  responder.success(res, {
    totalCount,
    status: httpStatus.OK,
    payload: data,
    serializer: codeSerializer,
  });
}
