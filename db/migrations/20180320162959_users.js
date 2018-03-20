
exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTable('users', (table) => {
    table.uuid("id").primary().defaultTo(knex.raw('uuid_generate_v1mc()')) // Primary key
    table.specificType('recordId', 'serial'); // Record incrementing key

    table.text('firstName').notNullable();
    table.text('lastName').notNullable();
    table.text('email').notNullable();
    table.text('password'); // Can be null when user has not choosen password yet
    table.boolean('hasAccess');
    table.text('role').notNullable();

    // Timestamps
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());

    // Unique constraints
    table.unique('email'); // Generates index automatically due to this constraint
  }),
]);

exports.down = (knex) => {
  return knex.schema.dropTable('users');
};
