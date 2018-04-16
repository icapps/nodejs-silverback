
exports.up = (knex, Promise) => {
  return knex.schema.table('code_types', (table) => {
    table.text('name').notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.table('code_types', (table) => {
    table.dropColumn('name');
  });
};
