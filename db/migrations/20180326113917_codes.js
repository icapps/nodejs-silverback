
exports.up = (knex, Promise) => {
  return knex.schema.createTable('codes', (table) => {
    table.uuid("id").primary().defaultTo(knex.raw('uuid_generate_v1mc()')) // Primary key
    table.specificType('recordId', 'serial'); // Record incrementing key

    // Not nullable
    table.text('code').notNullable();
    table.text('name').notNullable();
    table.uuid('codeTypeId').notNullable();

    // Nullable
    table.text('description').nullable();
    table.boolean('deprecated').nullable();

    // Tracking
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.text('createdBy');
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.text('updatedBy');

    // FK's
    table.foreign('codeTypeId').references('code_types.id')
    .onDelete('CASCADE').onUpdate('CASCADE');

    // Unique constraints (generates index automatically due to this constraint)
    table.unique(['codeTypeId', 'code']);
  });
}

exports.down = (knex) => {
  return knex.schema.dropTable('codes');
};
