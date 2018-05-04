
exports.up = async (knex) => {
  await knex.schema.createTable('codes', (table) => {
    table.uuid("id").primary().defaultTo(knex.raw('uuid_generate_v1mc()')) // Primary key
    table.specificType('record_id', 'serial'); // Record incrementing key

    // Not nullable
    table.text('code').notNullable();
    table.text('name').notNullable();
    table.uuid('code_type_id').notNullable();

    // Nullable
    table.text('description').nullable();
    table.boolean('deprecated').defaultTo(false);

    // Tracking
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // FK's
    table.foreign('code_type_id').references('code_types.id')
      .onDelete('CASCADE').onUpdate('CASCADE');

    // Unique constraints (generates index automatically due to this constraint)
    table.unique(['code_type_id', 'code']);
  });

  // Triggers
  await knex.raw('CREATE TRIGGER update_codes_updated BEFORE UPDATE ON codes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();')
}

exports.down = (knex) => {
  return knex.schema.dropTable('codes');
};
