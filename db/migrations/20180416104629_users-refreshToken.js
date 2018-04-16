
exports.up = (knex, Promise) => {
  return knex.schema.table('users', (table) => {
    table.text('refreshToken').nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.table('users', (table) => {
    table.dropColumn('refreshToken');
  });
};
