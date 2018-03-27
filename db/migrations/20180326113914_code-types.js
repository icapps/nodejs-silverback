
exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTable('codeTypes', (table) => {
    table.uuid("id").primary().defaultTo(knex.raw('uuid_generate_v1mc()')) // Primary key
    table.specificType('recordId', 'serial'); // Record incrementing key

    table.text('code').notNullable();
    table.text('description');

    // Timestamps
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());

    // Unique constraints
    table.unique('code'); // Generates index automatically due to this constraint
  }),
]);

exports.down = (knex) => {
  return knex.schema.dropTable('codeTypes');
};
