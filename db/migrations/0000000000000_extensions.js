exports.up = async (knex) => {
  return await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
};

exports.down = () => {};
