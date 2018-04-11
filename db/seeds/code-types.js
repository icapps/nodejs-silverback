
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('codes').del()
    .then(function () {
      return knex('code_types').del()
        .then(function () {
          return knex('code_types').insert([{ code: 'LANGUAGES' }], ['id'])
            .then(function (code) {
              return knex('codes').insert([
                { value: 'EN', codeTypeId: code[0].id },
                { value: 'NL', codeTypeId: code[0].id },
                { value: 'FR', codeTypeId: code[0].id }
              ]);
            });
        })
    });
};
