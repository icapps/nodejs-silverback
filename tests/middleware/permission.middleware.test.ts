import * as faker from 'faker';
import * as httpMocks from 'node-mocks-http';
import { errors } from '../../src/config/errors.config';
import { roles } from '../../src/config/roles.config';
import { hasPermission } from '../../src/middleware/permission.middleware';
import { getUserJwtTokens, getValidJwt, getUserSessionsTokens } from '../_helpers/mockdata/auth.data';
import { adminUser, createUsers, regularUser, inactiveUser, unconfirmedUser, createUser, removeUser } from '../_helpers/mockdata/user.data';
import { clearAll } from '../_helpers/mockdata/data';

describe('hasPermission middleware', () => {
  const users = { regular: null, admin: null, unconfirmed: null, inactive: null };

  beforeAll(async () => {
    await clearAll(); // Full db clear

    // Create all different type of users
    const { data: createdUsers } = await createUsers([regularUser, adminUser], 'active');
    [users.admin, users.regular] = createdUsers.sort((a, b) => a.role.code.localeCompare(b.role.code));

    users.inactive = await createUser(inactiveUser, 'inactive');
    users.unconfirmed = await createUser(unconfirmedUser, 'active');
  });

  afterAll(async () => {
    await clearAll(); // Full db clear - empty db after tests
  });

  describe('Jwt authentication', () => {
    const tokens = { regular: null, admin: null, unconfirmed: null, inactive: null };

    beforeAll(async () => {
      const createdTokens = await getUserJwtTokens([users.regular, users.admin, users.unconfirmed, users.inactive]);
      [tokens.regular, tokens.admin, tokens.unconfirmed, tokens.inactive] = createdTokens;
    });

    it('Should succesfully set current user on session request when authenticated', async () => {
      const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${tokens.regular}` } });
      const response = httpMocks.createResponse();

      expect.assertions(1);
      await hasPermission(request, response, (_nxt) => {
        expect(request.current.user.email).toEqual(regularUser.email);
      });
    });

    it('Should succesfully set current user on session request when authenticated with role', async () => {
      const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${tokens.admin}` } });
      const response = httpMocks.createResponse();

      expect.assertions(1);
      await hasPermission(request, response, (_nxt) => {
        expect(request.current.user.email).toEqual(adminUser.email);
      }, roles.ADMIN);
    });

    it('Should throw an error when user does not have the correct role', async () => {
      const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${tokens.regular}` } });
      const response = httpMocks.createResponse();

      expect.assertions(2);
      await hasPermission(request, response, (nxt) => {
        expect(nxt.code).toEqual(errors.NO_PERMISSION.code);
        expect(nxt.message).toEqual(errors.NO_PERMISSION.message);
      }, roles.ADMIN);
    });

    it('Should throw an error when user is not found', async () => {
      const token = await getValidJwt(faker.random.uuid());
      const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${token}` } });
      const response = httpMocks.createResponse();

      expect.assertions(2);
      await hasPermission(request, response, (nxt) => {
        expect(nxt.code).toEqual(errors.USER_NOT_FOUND.code);
        expect(nxt.message).toEqual(errors.USER_NOT_FOUND.message);
      });
    });

    it('Should throw an error when invalid jwt token is provided', async () => {
      const request = httpMocks.createRequest({ headers: { Authorization: `Bearer 1` } });
      const response = httpMocks.createResponse();

      expect.assertions(2);
      await hasPermission(request, response, (nxt) => {
        expect(nxt.code).toEqual(errors.INVALID_TOKEN.code);
        expect(nxt.message).toEqual(errors.INVALID_TOKEN.message);
      });
    });

    it('Should throw an error when no jwt token or session token is provided', async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();

      expect.assertions(2);
      await hasPermission(request, response, (nxt) => {
        expect(nxt.code).toEqual(errors.MISSING_HEADERS.code);
        expect(nxt.message).toEqual(errors.MISSING_HEADERS.message);
      });
    });

    it('Should throw an error when user has not yet confirmed his email', async () => {
      const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${tokens.unconfirmed}` } });
      const response = httpMocks.createResponse();

      await hasPermission(request, response, (nxt) => {
        expect(nxt.code).toEqual(errors.USER_UNCONFIRMED.code);
        expect(nxt.message).toEqual(errors.USER_UNCONFIRMED.message);
      });
    });

    it('Should throw an error when user has been set to inactive', async () => {
      const request = httpMocks.createRequest({ headers: { Authorization: `Bearer ${tokens.inactive}` } });
      const response = httpMocks.createResponse();

      await hasPermission(request, response, (nxt) => {
        expect(nxt.code).toEqual(errors.USER_INACTIVE.code);
        expect(nxt.message).toEqual(errors.USER_INACTIVE.message);
      });
    });
  });

  describe('Session authentication', () => {
    it('Should succesfully set current user on session request when authenticated', async () => {
      const request = httpMocks.createRequest({ session: { userId: users.regular.id } });
      const response = httpMocks.createResponse();

      expect.assertions(1);
      await hasPermission(request, response, (_nxt) => {
        expect(request.current.user.email).toEqual(users.regular.email);
      });
    });

    it('Should succesfully set current user on session request when authenticated with role', async () => {
      const request = httpMocks.createRequest({ session: { userId: users.admin.id } });
      const response = httpMocks.createResponse();

      expect.assertions(1);
      await hasPermission(request, response, (_nxt) => {
        expect(request.current.user.email).toEqual(users.admin.email);
      }, roles.ADMIN);
    });

    it('Should throw an error when user does not have the correct role', async () => {
      const request = httpMocks.createRequest({ session: { userId: users.regular.id } });
      const response = httpMocks.createResponse();

      expect.assertions(2);
      await hasPermission(request, response, (nxt) => {
        expect(nxt.code).toEqual(errors.NO_PERMISSION.code);
        expect(nxt.message).toEqual(errors.NO_PERMISSION.message);
      }, roles.ADMIN);
    });

    xit('Should throw an error when user is not found', async () => {
      const newUser: any = await createUser(Object.assign({}, users.admin, { email: 'notfounduser1234@hotmail.com' }), 'active');
      await removeUser(newUser.id);

      const request = httpMocks.createRequest({ session: { userId: newUser.id } });
      const response = httpMocks.createResponse();

      expect.assertions(2);
      await hasPermission(request, response, (nxt) => {
        expect(nxt.code).toEqual(errors.USER_NOT_FOUND.code);
        expect(nxt.message).toEqual(errors.USER_NOT_FOUND.message);
      });
    });

    it('Should throw an error when user has not yet confirmed his email', async () => {
      const request = httpMocks.createRequest({ session: { userId: users.unconfirmed.id } });
      const response = httpMocks.createResponse();

      await hasPermission(request, response, (nxt) => {
        expect(nxt.code).toEqual(errors.USER_UNCONFIRMED.code);
        expect(nxt.message).toEqual(errors.USER_UNCONFIRMED.message);
      });
    });

    it('Should throw an error when user has been set to inactive', async () => {
      const request = httpMocks.createRequest({ session: { userId: users.inactive.id } });
      const response = httpMocks.createResponse();

      await hasPermission(request, response, (nxt) => {
        expect(nxt.code).toEqual(errors.USER_INACTIVE.code);
        expect(nxt.message).toEqual(errors.USER_INACTIVE.message);
      });
    });
  });
});
