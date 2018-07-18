
const dotenv = require('dotenv-safe');
dotenv.load({ allowEmptyValues: true });

const faker = require('faker');
const { getHashedPassword } = require('tree-house-authentication');

exports.seed = async (knex) => {
  await knex('users').del();

  const users = [];
  const roles = ['ADMIN', 'USER'];

  const userStatusesCodeType = await knex('code_types')
    .select()
    .where('code', 'USER_STATUSES')
    .first();

  const userStatuses = await knex('codes')
    .select()
    .where('code_type_id', userStatusesCodeType.id)
    .andWhere('code', 'REGISTERED')

  for (let i = 0; i < 50; i += 1) {
    const randomRole = Math.floor(Math.random() * roles.length);
    users.push({
      email: faker.internet.email(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      password: faker.internet.password(),
      status: userStatuses[0].id,
      role: roles[randomRole],
    });
  }

  const hashedPw = await getHashedPassword(process.env.INITIAL_SEED_PASSWORD, parseInt(process.env.SALT_COUNT || '10', 10));
  users.push({
    email: process.env.INITIAL_SEED_USERNAME,
    first_name: 'development',
    last_name: 'icapps',
    password: hashedPw,
    status: userStatuses[0].id,
    role: 'ADMIN',
  });

  // Inserts seed entries
  return knex('users').insert(users);
};
