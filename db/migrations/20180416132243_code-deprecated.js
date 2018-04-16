
exports.up = (knex, Promise) => {
  return knex.schema.table('codes', (table) => {
    table.boolean('deprecated').nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.table('users', (table) => {
    table.dropColumn('deprecated');
  });
};
