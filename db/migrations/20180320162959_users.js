
exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTable('users', (table) => {
    table.uuid("id").primary().defaultTo(knex.raw('uuid_generate_v1mc()')) // Primary key
    table.specificType('recordId', 'serial'); // Record incrementing key

    // Not nullable
    table.text('firstName').notNullable();
    table.text('lastName').notNullable();
    table.text('email').notNullable();
    table.text('role').notNullable();

    // Nullable
    table.text('password').nullable();
    table.boolean('hasAccess').nullable();
    table.text('resetPwToken').nullable();
    table.text('refreshToken').nullable();

    // Tracking
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.text('createdBy');
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.text('updatedBy');

    // Unique constraints (generates index automatically due to this constraint)
    table.unique('email');
    table.unique('resetPwToken');
    table.unique(['id', 'refreshToken']);
  }),
]);

exports.down = (knex) => {
  return knex.schema.dropTable('users');
};
