'use strict';

var User = require('../../../app/models').User;

describe('DELETE /cancel_account', () => {
  db.sync();

  let user;

  beforeEach(() => {
    user = factory.buildSync('user');
    return user.save();
  });

  it('destroys the user account', (done) => {
    api
    .cancelAccount(user)
    .expect(204)
    .end((err, res) => {
      if (err) { return done(err); }

      expect(User.findOne({ where: user }))
        .to.eventually.be.null
        .notify(done);
    });
  });
});