
exports.up = (knex, Promise) => {
  return knex.schema.createTable('codes', (table) => {
    table.uuid("id").primary().defaultTo(knex.raw('uuid_generate_v1mc()')) // Primary key
    table.specificType('recordId', 'serial'); // Record incrementing key

    table.text('value').notNullable();

    table.uuid('codeTypeId').notNullable();
    table.foreign('codeTypeId').references('code_types.id')
      .onDelete('CASCADE').onUpdate('CASCADE');

    // Timestamps
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
}

exports.down = (knex) => {
  return knex.schema.dropTable('codes');
};
