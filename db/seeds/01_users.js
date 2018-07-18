
const dotenv = require('dotenv-safe');
dotenv.load({ allowEmptyValues: true });

const faker = require('faker');
const { getHashedPassword } = require('tree-house-authentication');

exports.seed = (knex) => {
  return knex('users').del()
    .then(() => {
      const users = [];
      const roles = ['ADMIN', 'USER'];

      for (let i = 0; i < 50; i += 1) {
        const randomRole = Math.floor(Math.random() * roles.length);
        users.push({
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          password: faker.internet.password(),
          has_access: faker.random.boolean(),
          role: roles[randomRole],
        });
      }

      return getHashedPassword(process.env.INITIAL_SEED_PASSWORD, parseInt(process.env.SALT_COUNT || '10', 10))
        .then((hashedPw) => {
          users.push({
            email: process.env.INITIAL_SEED_USERNAME,
            first_name: 'development',
            last_name: 'iCapps',
            password: hashedPw,
            has_access: true,
            role: 'ADMIN',
          });

          // Inserts seed entries
          return knex('users').insert(users);
        });

    });
};
