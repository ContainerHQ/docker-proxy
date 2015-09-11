'use strict';

let sequelize = require('sequelize'),
  errors = require('../../app/support').errors,
  errorHandler = rewire('../../app/middlewares/error_handler');

const INTERNAL_SERVER_ERROR = errorHandler.__get__('INTERNAL_SERVER_ERROR');

describe('ErrorHandler Middleware', () => {
  let res = {}, fakeConsole;

  beforeEach(() => {
    res.json = sinon.stub();
    res.status = sinon.stub().returns(res);

    fakeConsole = { error: sinon.stub() };

    errorHandler.__set__('console', fakeConsole);
  });

  [
    'ValidationError',
    'UniqueConstraintError'
  ].forEach(errorName => {
    context(`with a ${errorName}`, () => {
      let err = new sequelize[errorName]();

      it('sends a bad request status', done => {
        errorHandler(err, {}, res, () => {
          expect(res.status).to.have.been.calledWith(400);
          done();
        });
      });

      it('sends validation errors', done => {
        errorHandler(err, {}, res, () => {
          expect(res.json).to.have.been.calledWith({ errors: err.errors });
          done();
        });
      });
    });
  });

  context('with a MismatchError', () => {
    let err = new errors.MismatchError('test');

    it('sends a bad request status', done => {
      errorHandler(err, {}, res, () => {
        expect(res.status).to.have.been.calledWith(400);
        done();
      });
    });

    it('sends validation errors', done => {
      errorHandler(err, {}, res, () => {
        expect(res.json).to.have.been.calledWith({ errors: err.errors });
        done();
      });
    });
  });

  context('with a PaginationError', () => {
    let err = new errors.PaginationError({
      attribute: 'limit',
      value: -5,
      range: [0, 25]
    });

    it('sends a bad request status', done => {
      errorHandler(err, {}, res, () => {
        expect(res.status).to.have.been.calledWith(400);
        done();
      });
    });

    it('sends a pagination error', done => {
      errorHandler(err, {}, res, () => {
        expect(res.json).to.have.been.calledWith({ error: err.message });
        done();
      });
    });
  });

  [
    ['StateError', 422],
    ['AlreadyUpgradedError', 409],
    ['NotMasterError', 403],
    ['MachineCredentialsError', 401],
    ['MachineNotFoundError', 404],
    ['MachineUnprocessableError', 422, random.string()]
  ].forEach(([errorName, status, opts]) => {
    context(`with a ${errorName}`, () => {
      let err = new errors[errorName](opts);

      it(`sends a ${status} request status`, done => {
        errorHandler(err, {}, res, () => {
          expect(res.status).to.have.been.calledWith(status);
          done();
        });
      });

      it('sends the error message back', done => {
        errorHandler(err, {}, res, () => {
          expect(res.json).to.have.been.calledWith({ error: err.message });
          done();
        });
      });
    });
  });

  context('with any other error', () => {
    let err = new Error('whatever');

    it('sends an internal server error status', done => {
      errorHandler(err, {}, res, () => {
        expect(res.status).to.have.been.calledWith(500);
        done();
      });
    });

    it('sends an internal server error message', done => {
      errorHandler(err, {}, res, () => {
        expect(res.json)
          .to.have.been.calledWith({ error: INTERNAL_SERVER_ERROR });
        done();
      });
    });

    it('logs the error message', done => {
      errorHandler(err, {}, res, () => {
        expect(fakeConsole.error).to.have.been.calledWith(err.message);
        done();
      });
    });
  });
});
