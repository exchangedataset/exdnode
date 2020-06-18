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
        start: '2020-01-01 00:00:00Z',
      }).catch(() => done());
    });
    it('provide exchange, channel, start, end', function(done) {
      client.http.filter({
        exchange: 'bitmex',
        channels: ['orderBookL2'],
        start: '2020-01-01 00:00:00Z',
        end: '2020-01-01 00:01:00Z',
      }).catch(() => done());
    });
    it('provide exchange, channel, start, end, minute', function(done) {
      client.http.filter({
        exchange: 'bitmex',
        channels: ['orderBookL2'],
        start: '2020-01-01 00:00:00Z',
        end: '2020-01-01 00:01:00Z',
        minute: '2020-01-01 00:00Z',
      }).catch(() => done());
    });
    it('provide all', function(done) {
      this.timeout(20000)
      // except it to NOT throw
      client.http.filter({
        exchange: 'bitmex',
        channels: ['orderBookL2'],
        start: '2020-01-01 00:00:00Z',
        end: '2020-01-01 00:01:00Z',
        minute: '2020-01-01 00:00Z',
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
        at: '2020-01-01 00:00:00Z',
        format: 'raw',
      }).then(() => done()).catch(done);
    });
  });
});
