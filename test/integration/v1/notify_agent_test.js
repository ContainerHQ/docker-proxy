'use strict';

let _ = require('lodash'),
  Node = require('../../../app/models').Node;

describe('POST /agent/:token/notify', () => {
  db.sync();

  let node, cluster;

  beforeEach(() => {
    cluster = factory.buildSync('cluster');
    return cluster.save().then(() => {
      node = factory.buildSync('node', { cluster_id: cluster.id });
      return node.save();
    });
  });

  const FORM = {
    docker_version: '0.0.0', swarm_version:  '0.0.0',
    cpu: 3, memory: 2048, disk: 2.048
  };

  it('updates the node attributes and its last_state to running', done => {
    api.agent(node).notify(FORM).expect(204, (err, res) => {
      if (err) { return done(err); }

      expect(node.reload())
        .to.eventually.include(FORM).and
        .to.have.property('last_state', 'running')
        .notify(done);
    });
  });

  it('updates the cluster last_state to running', done => {
    api.agent(node).notify(FORM).expect(204, (err, res) => {
      if (err) { return done(err); }

      expect(cluster.reload())
        .to.eventually.have.property('last_state', 'running')
        .notify(done);
    });
  });

  context('with invalid attributes', () => {
    it('responds with a bad request status and validation errors', done => {
      let form = { cpu: -1 };

      api.agent(node).notify(form).expect(400, (err, res) => {
        if (err) { return done(err); }

        expect(node.update(form))
          .to.be.rejectedWith(res.body.errors)
          .notify(done);
      });
    });
  });

  context('with blacklisted attributes', () => {
    let attributes, form;

    /*
     * last_state is automatically set to running and therefore is
     * ignored in this test.
     */
    beforeEach(() => {
      attributes = _.difference(node.attributes,
        [
          'docker_version', 'swarm_version', 'cpu', 'memory',
          'disk', 'last_state', 'last_ping', 'containers_count',
          'id', 'created_at', 'updated_at'
        ]
      );
      form = factory.buildSync('forbiddenNode').dataValues;
    })

    it('these attributes are filtered', done => {
      api.agent(node).notify(form)
      .expect(204, (err, res) => {
        if (err) { return done(err); }

        expect(Node.findById(node.id))
          .to.eventually.satisfy(has.beenFiltered(node, attributes, false))
          .notify(done);
      });
    });
  });

  context('when node no longer exists', () => {
    beforeEach(() => {
      return node.destroy();
    });

    it('returns a 404 not found', done => {
      api.agent(node).notify().expect(404, done);
    });
  });

  context('when token is invalid', () => {
    it('returns a 401 unauthorized', done => {
      api.agent().notify().expect(401, done);
    });
  });
});
