
exports.up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.uuid("id").primary().defaultTo(knex.raw('uuid_generate_v1mc()')) // Primary key
    table.specificType('record_id', 'serial'); // Record incrementing key

    // Not nullable
    table.text('first_name').notNullable();
    table.text('last_name').notNullable();
    table.text('email').notNullable();
    table.text('role').notNullable();
    table.boolean('registration_completed').defaultTo(false);

    // Nullable
    table.text('password').nullable();
    table.boolean('has_access').nullable();
    table.text('reset_pw_token').nullable();
    table.text('refresh_token').nullable();

    // Tracking
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Unique constraints (generates index automatically due to this constraint)
    table.unique('email');
    table.unique('reset_pw_token');
    table.unique(['id', 'refresh_token']);
  });

  // Triggers
  await knex.raw('CREATE TRIGGER update_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();')
};

exports.down = (knex) => {
  return knex.schema.dropTable('users');
};
