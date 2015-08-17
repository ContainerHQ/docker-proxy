'use strict';

module.exports = {
  validJWT: require('./valid_jwt'),
  hashPassword: require('./hash_password'),
  beenFiltered: require('./been_filtered'),
  latestVersions: require('./latest_versions'),
  one: require('./one'),
  many: require('./many'),
  manyFiltered: require('./many_filtered')
};
