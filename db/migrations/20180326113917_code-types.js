
exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTable('codeTypes', (table) => {
    table.uuid("id").primary().defaultTo(knex.raw('uuid_generate_v1mc()')) // Primary key
    table.specificType('recordId', 'serial'); // Record incrementing key

    table.text('value').notNullable();

    table.uuid('codeId').notNullable();
    table.foreign('codeId').references('codes.id');

    // Timestamps
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
  }),
]);

exports.down = (knex) => {
  return knex.schema.dropTable('codeTypes');
};
