
exports.seed = function (knex, Promise) {
  return knex('users').del()
    .then(() => {
      // Inserts seed entries
      return knex('users').insert([
        {
          email: 'development@icapps.com',
          firstName: 'development',
          lastName: 'iCapps',
          password: '',
          hasAccess: true,
          role: 'ADMIN',
        }
      ]);
    });
};
