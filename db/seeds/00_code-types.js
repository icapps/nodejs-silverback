
exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('codes').del();
  await knex('code_types').del()

  const languageCode = await knex('code_types').insert([{ code: 'LANGUAGES', name: 'Languages', description: 'Languages' }], ['id'])
  await knex('codes').insert([
    { code: 'EN', name: 'English', code_type_id: languageCode[0].id },
    { code: 'NL', name: 'Nederlands', code_type_id: languageCode[0].id },
    { code: 'FR', name: 'French', code_type_id: languageCode[0].id },
  ]);

  const userStatusCode = await knex('code_types').insert([{ code: 'USER_STATUSES', name: 'User statuses', description: 'User Account Statuses' }], ['id'])
  await knex('codes').insert([
    { code: 'COMPLETE_REGISTRATION', name: 'Must complete registration', code_type_id: userStatusCode[0].id },
    { code: 'REGISTERED', name: 'Registered account', code_type_id: userStatusCode[0].id },
    { code: 'BLOCKED', name: 'Blocked account', code_type_id: userStatusCode[0].id },
  ]);
};

