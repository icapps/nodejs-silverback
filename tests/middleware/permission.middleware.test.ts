import * as faker from 'faker';
import * as httpMocks from 'node-mocks-http';
import { errors } from '../../src/config/errors.config';
import { roles } from '../../src/config/roles.config';
import { hasPermission } from '../../src/middleware/permission.middleware';
import { getBlockedStateUserToken, getUnconfirmedUserToken, getUserTokens, getValidJwt } from '../_helpers/mockdata/auth.data';
import { clearAll } from '../_helpers/mockdata/data';
import { adminUser, createUsers, regularUser } from '../_helpers/mockdata/user.data';

describe('hasPermission middleware', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  const users = { regular: null, admin: null };
  const tokens = { regular: null, admin: null };
  let unconfirmedToken;
  let blockedToken;

  beforeAll(async () => {
    await clearAll(); // Full db clear

    // Create a regular and admin user
    const { data: createdUsers } = await createUsers([regularUser, adminUser], 'registered');
    const sorted = createdUsers.sort((a, b) => a.role.code.localeCompare(b.role.code));
    [users.admin, users.regular] = sorted;

    // All user type tokens
    const createdTokens = await getUserTokens([users.regular, users.admin]);
    [tokens.regular, tokens.admin] = createdTokens;

    unconfirmedToken = await getUnconfirmedUserToken(); // Also creates user
    blockedToken = await getBlockedStateUserToken(); // Also creates user
  });

  afterAll(async () => {
    await clearAll(); // Full db clear - empty db after tests
  });

  it('Should succesfully set current user on session request when authenticated', async () => {
    const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${tokens.regular}` } });
    const response = httpMocks.createResponse();

    expect.assertions(1);
    await hasPermission(request, response, (nxt) => {
      expect(request.current.user.email).toEqual(regularUser.email);
    });
  });

  it('Should succesfully set current user on session request when authenticated with role', async () => {
    const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${tokens.admin}` } });
    const response = httpMocks.createResponse();

    expect.assertions(1);
    await hasPermission(request, response, (nxt) => {
      expect(request.current.user.email).toEqual(adminUser.email);
    }, roles.ADMIN);
  });

  it('Should throw an error when user does not have the correct role', async () => {
    const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${tokens.regular}` } });
    const response = httpMocks.createResponse();

    expect.assertions(2);
    const result = await hasPermission(request, response, (nxt) => {
      expect(nxt.code).toEqual(errors.NO_PERMISSION.code);
      expect(nxt.message).toEqual(errors.NO_PERMISSION.message);
    }, roles.ADMIN);
  });

  it('Should throw an error when user is not found', async () => {
    const token = await getValidJwt(faker.random.uuid());
    const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${token}` } });
    const response = httpMocks.createResponse();

    expect.assertions(2);
    const result = await hasPermission(request, response, (nxt) => {
      expect(nxt.code).toEqual(errors.USER_NOT_FOUND.code);
      expect(nxt.message).toEqual(errors.USER_NOT_FOUND.message);
    });
  });

  it('Should throw an error when no jwt token is provided', async () => {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();

    expect.assertions(2);
    const result = await hasPermission(request, response, (nxt) => {
      expect(nxt.code).toEqual(errors.INVALID_TOKEN.code);
      expect(nxt.message).toEqual(errors.INVALID_TOKEN.message);
    });
  });

  it('Should throw an error when user has not yet confirmed his email', async () => {
    const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${unconfirmedToken}` } });
    const response = httpMocks.createResponse();

    const result = await hasPermission(request, response, (nxt) => {
      expect(nxt.code).toEqual(errors.USER_UNCONFIRMED.code);
      expect(nxt.message).toEqual(errors.USER_UNCONFIRMED.message);
    });
  });

  it('Should throw an error when user is blocked', async () => {
    const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${blockedToken}` } });
    const response = httpMocks.createResponse();

    const result = await hasPermission(request, response, (nxt) => {
      expect(nxt.code).toEqual(errors.USER_BLOCKED.code);
      expect(nxt.message).toEqual(errors.USER_BLOCKED.message);
    });
  });
});
