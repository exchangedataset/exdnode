const assert = require('assert');
const { createClient } = require('../lib/index');

const APIKEY = 'cGpvbmtRZnF1ZGdidTJMM0dPQTY4TWw1dFl1bHNXTks';

describe('Client', function() {
  describe('createClient', function() {
    it('should not throw when a valid API key is given', function() {
      assert.doesNotThrow(function() {
        createClient({ apikey: APIKEY });
      });
    });
    it('should throw when a INVALID API key is given', function() {
      assert.throws(function() {
        createClient({ apikey: 'this is invalid' })
      });
    });
  });
});

describe('FilterRequest', function() {
  const client = createClient({ apikey: APIKEY });
  const params = {
    exchange: 'bitmex',
    start: 26375331,
    end: 26375331,
    channels: ['orderBookL2'],
  };
  const truncate = {
    exchange: 'bitmex',
    // cut 20 seconds after the beginning of shard
    start: (26375331n * 60n + 20n) * 1000000000n,
    // truncate 25 seconds before end of shard
    end: (26375332n * 60n - 25n) * 1000000000n,
    channels: ['orderBookL2'],
  };
  describe('download', function() {
    it('normal', async function() {
      this.timeout(10000);
      const req = client.filter(params);
      const res = await req.download();
      assert.notDeepEqual(res.length, 0, 'returned array empty: expected at least one line');
    });
    it('multiple shard', async function() {
      this.timeout(20000);
      const req = client.filter(truncate);
      const res = await req.download();
      assert.notDeepEqual(res.length, 0, 'returned array empty: expected at least one line');
      // all of timestamps of lines must be within value which caller intended
      for (line of res) {
        assert.ok(truncate.start <= line.timestamp && line.timestamp < truncate.end, `timestamp is out of range of what expected: ${line.timestamp}, exp: ${truncate.start} -> ${truncate.end}`);
      }
    });
  });
  describe('stream', function() {
    it('normal', async function() {
      this.timeout(10000);
      const req = client.filter(params);
      const itr = req.stream()[Symbol.asyncIterator]();
      const next = await itr.next();
      assert.ok(next.done === false, 'no line returned: at least one line is expected');
    });
    it('multiple shard', async function() {
      this.timeout(20000);
      const req = client.filter(truncate);
      const stream = req.stream();
      let count = 0;
      for await (line of stream) {
        assert.ok(truncate.start <= line.timestamp && line.timestamp < truncate.end, `timestamp is out of range of what expected: ${line.timestamp}, exp: ${truncate.start} -> ${truncate.end}`);
        count++;
      }
      assert.notDeepEqual(count, 0, 'no line returned: at least one line is expected');
    });
  });
});