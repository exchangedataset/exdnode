const assert = require('assert');
const { createClient } = require('../lib/index');
const { APIKEY } = require('./constants');

describe('http', function() {
  const client = createClient({ apikey: APIKEY });

  describe('filter', function() {
    it('no parameter', function(done) {
      // expect it to throw
      client.http.filter().catch(() => done());
    });
    it('provide exchange', function(done) {
      client.http.filter({
        exchange: 'bitmex',
      }).catch(() => done());
    });
    it('provide exchange, no channel', function(done) {
      client.http.filter({
        exchange: 'bitmex',
        channels: [],
      }).catch(() => done());
    });
    it('provide exchange, channel', function(done) {
      client.http.filter({
        exchange: 'bitmex',
        channels: ['orderBookL2'],
      }).catch(() => done());
    });
    it('provide exchange, channel, start', function(done) {
      client.http.filter({
        exchange: 'bitmex',
        channels: ['orderBookL2'],
        start: 26375331,
      }).catch(() => done());
    });
    it('provide exchange, channel, start, end', function(done) {
      client.http.filter({
        exchange: 'bitmex',
        channels: ['orderBookL2'],
        start: 26375331,
        end: 26375331,
      }).catch(() => done());
    });
    it('provide exchange, channel, start, end, minute', function(done) {
      client.http.filter({
        exchange: 'bitmex',
        channels: ['orderBookL2'],
        start: 26375331,
        end: 26375331,
        minute: 26375331,
      }).catch(() => done());
    });
    it('provide all', function(done) {
      this.timeout(20000)
      // except it to NOT throw
      client.http.filter({
        exchange: 'bitmex',
        channels: ['orderBookL2'],
        start: 26430647,
        end: 26430647,
        minute: 26430647,
        format: 'raw',
      }).then(() => done()).catch(done);
    });
  });

  describe('snapshot', function() {
    it('fetch', function(done) {
      this.timeout(20000)
      // except it to NOT throw
      client.http.snapshot({
        exchange: 'bitmex',
        channels: ['orderBookL2'],
        at: 26430647,
        format: 'raw',
      }).then(() => done()).catch(done);
    });
  });
});
