'use strict';

var User = require('../../../app/models').User;

const NEW_EMAIL = 'new.email@arkis.io';

describe('PATCH /account/change_email', () => {
  db.sync();

  let user, oldEmail, password;

  beforeEach(() => {
    user = factory.buildSync('user');
    oldEmail = user.oldEmail;
    password = user.password;
    return user.save();
  });

  it('updates the user email', done => {
    api
    .changeEmail(user)
    .field('password', password)
    .field('email', NEW_EMAIL)
    .expect(204)
    .end((err, res) => {
      if (err) { return done(err); }

      expect(user.reload())
        .to.eventually.have.property('email', NEW_EMAIL)
        .notify(done);
    });
  });

  context('with incorrect current password', () => {
    it('returns an unauthorized status', done => {
      api
      .changeEmail(user)
      .field('password', `${password}*`)
      .expect(401)
      .end((err, res) => {
        if (err) { return done(err); }

        expect(user.reload())
          .to.eventually.have.property('email', oldEmail)
          .notify(done);
      });
    });
  });

  context('with invalid email address', () => {
    it('returns a bad request status and errors', done => {
      api
      .changeEmail(user)
      .field('password', password)
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err); }

        expect(user.reload())
          .to.eventually.have.property('email', oldEmail)
          .notify(done);
      });
    });
  });

  context('with forbidden attributes', () => {
    let attributes, reference;

    /*
     * The password can be ignored here, we already ensure
     * that the password field is used to verify the user
     * password.
     */
    beforeEach(() => {
      attributes = _.difference(user.attributes,
        ['id', 'email', 'password', 'created_at', 'updated_at']
      );
      reference = factory.buildSync('forbiddenUser');
    });

    it('these attributes are filtered', done => {
      api.callWithAttributes(attributes, reference,
        api.changeEmail(user)
      )
      .field('password', password)
      .field('email', NEW_EMAIL)
      .expect(204)
      .end((err, res) => {
        if (err) { return done(err); }

        expect(User.findById(user.id))
          .to.eventually.satisfy(has.beenFiltered(user, attributes))
          .notify(done);
      });
    });
  });
});
