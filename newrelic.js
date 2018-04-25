
exports.config = {
  app_name: [`SILVERBACK ${process.env.NODE_ENV}`],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: process.env.LOG_LEVEL,
  },
};
