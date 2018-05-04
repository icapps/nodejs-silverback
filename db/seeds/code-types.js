
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('codes').del()
    .then(function () {
      return knex('code_types').del()
        .then(function () {
          return knex('code_types').insert([{ code: 'LANGUAGES', name: 'Languages' }], ['id'])
            .then(function (code) {
              return knex('codes').insert([
                { code: 'EN', name: 'English', code_type_id: code[0].id },
                { code: 'NL', name: 'Nederlands', code_type_id: code[0].id },
                { code: 'FR', name: 'French', code_type_id: code[0].id }
              ]);
            });
        })
    });
};
