
exports.up = (knex, Promise) =>{
  return knex.schema.createTable('code_types', (table) => {
    table.uuid("id").primary().defaultTo(knex.raw('uuid_generate_v1mc()')) // Primary key
    table.specificType('recordId', 'serial'); // Record incrementing key

    // Not nullable
    table.text('code').notNullable();
    table.text('name').notNullable();

    // Nullable
    table.text('description').nullable();

    // Tracking
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.text('createdBy');
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.text('updatedBy');

    // Unique constraints (generates index automatically due to this constraint)
    table.unique('code');
  });
}

exports.down = (knex) => {
  return knex.schema.dropTable('codeTypes');
};
