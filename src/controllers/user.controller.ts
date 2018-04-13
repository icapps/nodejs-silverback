import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { responder } from '../lib/responder';
import { userSerializer } from '../serializers/user.serializer';
import * as userService from '../services/user.service';


/**
 * Get a user by id
 */
export async function findById(req: Request, res: Response): Promise<void> {
  const result = await userService.findById(req.params.userId);
  responder.success(res, {
    status: httpStatus.OK,
    payload: result,
    serializer: userSerializer,
  });
}


/**
 * Return all users
 */
export async function findAll(req: Request, res: Response): Promise<void> {
  const { data, totalCount } = await userService.findAll(req.query);
  responder.success(res, {
    totalCount,
    status: httpStatus.OK,
    payload: data,
    serializer: userSerializer,
  });
}


/**
 * Create a new user
 */
export async function create(req: Request, res: Response): Promise<void> {
  const { changePassword } = req.query;
  const result = await userService.create(req.body, changePassword);
  responder.success(res, {
    status: httpStatus.CREATED,
    payload: result,
    serializer: userSerializer,
  });
}


/**
 * Update an existing user
 */
export async function update(req: Request, res: Response): Promise<void> {
  const result = await userService.update(req.params.userId, req.body);
  responder.success(res, {
    status: httpStatus.OK,
    payload: result,
    serializer: userSerializer,
  });
}


/**
 * Update a property of an existing user
 */
export async function partialUpdate(req: Request, res: Response): Promise<void> {
  const result = await userService.partialUpdate(req.params.userId, req.body);
  responder.success(res, {
    status: httpStatus.OK,
    payload: result,
    serializer: userSerializer,
  });
}


/**
 * Remove an existing user
 */
export async function remove(req: Request, res: Response): Promise<void> {
  await userService.remove(req.params.userId);
  responder.success(res, {
    status: httpStatus.NO_CONTENT,
  });
}
