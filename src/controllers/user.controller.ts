import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { ValidationError, BadRequestError } from 'tree-house-errors';
import { responder } from '../lib/responder';
import { userSerializer } from '../serializers/user.serializer';
import { roles } from '../config/roles.config';
import { errors } from '../config/errors.config';
import { roleSerializer } from '../serializers/role.serializer';
import { AuthRequest } from '../models/request.model';
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

  // TODO: This should be able via Joi validation?
  if (!changePassword && !req.body.password) throw new ValidationError();

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
 * Update a user's password
 */
export async function updatePassword(req: Request, res: Response): Promise<void> {
  const { password } = req.body;
  await userService.updatePassword(req.params.userId, password);
  responder.success(res, {
    status: httpStatus.OK,
  });
}

/**
 * Remove an existing user
 */
export async function remove(req: AuthRequest, res: Response): Promise<void> {
  if (req.session.user.id === req.params.userId) throw new BadRequestError(errors.USER_DELETE_OWN);
  await userService.remove(req.params.userId);
  responder.success(res, {
    status: httpStatus.NO_CONTENT,
  });
}

/**
 * Return all available user roles
 */
export async function findAllUserRoles(_req: Request, res: Response): Promise<void> {
  const result = Object.keys(roles).reduce((array, current) => [...array, roles[current]], []); // Collection to array
  responder.success(res, {
    status: httpStatus.OK,
    payload: result,
    serializer: roleSerializer,
  });
}
