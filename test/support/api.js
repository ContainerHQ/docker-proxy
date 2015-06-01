var request = require('supertest'),
  app = require('../../app');

const ROUTE = '/api/v1';

module.exports = {
  login: function(user) {
    return request(app)
    .post(`${ROUTE}/login`)
    .field('email', user.email)
    .field('password', user.password);
  },
  profile: function(user, token=user.token) {
    return request(app)
    .get(`${ROUTE}/profile`)
    .set('Authorization', `JWT ${token}`);
  },
  changePassword: function(user) {
    return request(app)
    .post(`${ROUTE}/change_password`)
    .set('Authorization', `JWT ${user.token}`);
  },
  authGitHub: function() {
    return request(app)
    .get(`${ROUTE}/auth/github`);
  }
};