'use strict';

let  _ = require('lodash'),
  config = require('../../../config');

describe('POST /clusters/:cluster_id/upgrade', () => {
  db.sync();

  let user, cluster;

  beforeEach(() => {
    user = factory.buildSync('user');
    return user.save().then(() => {
      cluster = factory.buildSync('cluster', { user_id: user.id });
      return cluster.save();
    });
  });

  context('when cluster is running', () => {
    beforeEach(() => {
      return cluster.update({ last_state: 'running', last_ping: Date.now() });
    });

    context('when cluster already has the latest version', () => {
      beforeEach(() => {
        let versions = {
          docker_version: config.latestVersions.docker,
          swarm_version:  config.latestVersions.swarm
        };
        return cluster.update(versions);
      });

      it("doesn't upgrade the cluster and returns an error", done => {
        api.clusters(user).upgrade(cluster.id).expect(409, done);
      });
    });

    context('when cluster has old versions', () => {
      beforeEach(() => {
        let versions = {
          docker_version: config.oldestVersions.docker,
          swarm_version:  config.oldestVersions.swarm
        };
        return cluster.update(versions);
      });

      context('when cluster has no reachable node', () => {
        it("doesn't upgrade the cluster", done => {
          let previousState = cluster.state;

          api.clusters(user).upgrade(cluster.id)
          .expect(204, (err, res) => {
            if (err) { return done(err); }

            expect(cluster.reload())
              .to.eventually.satisfy(has.latestVersions)
              .notify(done);
          });
        });
      });

      context('when cluster has reachable nodes', () => {
        beforeEach(done => {
          let opts = { cluster_id: cluster.id };

          factory.createMany('runningNode', opts, 5, done);
        });

        it('upgrades the cluster', done => {
          api.clusters(user).upgrade(cluster.id)
          .expect(204, (err, res) => {
            if (err) { return done(err); }

            expect(cluster.reload())
              .to.eventually.satisfy(has.latestVersions)
              .notify(done);
          });
        });
      });
    });
  });

  context('when cluster is not running', () => {
    it("doesn't upgrade the cluster and returns an error", done => {
      api.clusters(user).upgrade(cluster.id).expect(409, done);
    });
  });

  context('when cluster id is invalid', () => {
    it('returns a 404 not found', done => {
      api.clusters(user).upgrade(0).expect(404, done);
    });
  });

  context('when API token is incorrect', () => {
    it('returns an unauthorized status', done => {
      api.clusters().upgrade(cluster.id).expect(401, done);
    });
  })
});
