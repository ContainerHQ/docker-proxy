'use strict';

let errors = require('../../app/routes/shared/errors'),
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

  context('with a validation error', () => {
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

  context('with a pagination error', () => {
    let err = new errors.PaginationError('limit', -5);

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
