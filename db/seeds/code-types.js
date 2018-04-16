
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('codes').del()
    .then(function () {
      return knex('code_types').del()
        .then(function () {
          return knex('code_types').insert([{ code: 'LANGUAGES', name: 'Languages' }], ['id'])
            .then(function (code) {
              return knex('codes').insert([
                { code: 'EN', name: 'English', codeTypeId: code[0].id },
                { code: 'NL', name: 'Nederlands', codeTypeId: code[0].id },
                { code: 'FR', name: 'French', codeTypeId: code[0].id }
              ]);
            });
        })
    });
};
