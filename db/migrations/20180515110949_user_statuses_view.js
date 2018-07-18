
exports.up = async (knex) => {
  await knex.raw(`
    CREATE VIEW user_statuses_view
    AS
    SELECT codes.id, codes.code, codes.name, codes.description
    FROM (codes JOIN code_types ON ((codes.code_type_id = code_types.id)))
    WHERE (code_types.code = 'USER_STATUSES');
  `)
};

exports.down = (knex) => {
  return knex.raw(`DROP VIEW user_statuses_view`);
};
