
exports.up = async (knex) =>{
  await knex.schema.createTable('code_types', (table) => {
    table.uuid("id").primary().defaultTo(knex.raw('uuid_generate_v1mc()')) // Primary key
    table.specificType('record_id', 'serial'); // Record incrementing key

    // Not nullable
    table.text('code').notNullable();
    table.text('name').notNullable();

    // Nullable
    table.text('description').nullable();

    // Tracking
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Unique constraints (generates index automatically due to this constraint)
    table.unique('code');
  });

  // Triggers
  await knex.raw('CREATE TRIGGER update_code_types_updated BEFORE UPDATE ON code_types FOR EACH ROW EXECUTE PROCEDURE update_modified_column();')
}

exports.down = (knex) => {
  return knex.schema.dropTable('codeTypes');
};
