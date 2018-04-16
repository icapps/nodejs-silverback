
exports.up = (knex, Promise) => {
  return knex.schema.table('codes', (table) => {
    table.dropColumn('value');

    table.text('code').notNullable();
    table.text('name').notNullable();
    table.text('description');

    table.unique(['codeTypeId', 'code']); // Generates index automatically due to this constraint
  });
};

exports.down = (knex) => {
  return knex.schema.table('codes', (table) => {
    table.text('value').notNullable();
  });
};
