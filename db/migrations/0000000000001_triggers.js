exports.up = async (knex) => {
  return await knex.raw(`CREATE OR REPLACE FUNCTION update_modified_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW."updatedAt" = now();
      RETURN NEW;
  END;
  $$ language 'plpgsql';
  `);
};

exports.down = () => {};
