import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { responder } from '../lib/responder';
import { codeSerializer } from '../serializers/meta.serializer';
import * as metaService from '../services/meta.service';



/**
 * Return all codes for a specific code type
 */
export async function findAllCodes(req: Request, res: Response): Promise<void> {
  const codeTypeId = req.params.codeTypeId;
  const { data, totalCount } = await metaService.findAllCodes(codeTypeId, req.query);
  responder.success(res, {
    totalCount,
    status: httpStatus.OK,
    payload: data,
    serializer: codeSerializer,
  });
}


export async function createCode(req: Request, res: Response): Promise<void> {
  const codeTypeId = req.params.codeTypeId;
  const result = await metaService.createCode(codeTypeId, req.body);
}
