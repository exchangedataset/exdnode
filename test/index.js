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
  let downloadParams = [];
  let downloadTruncate = [];

  describe('download', function() {
    it('normal', async function() {
      this.timeout(20000);
      const req = client.filter(params);
      const res = await req.download();
      downloadParams = res;
      assert.notDeepEqual(res.length, 0, 'returned array empty: expected at least one line');
    });
    it('multiple shard', async function() {
      this.timeout(20000);
      const req = client.filter(truncate);
      const res = await req.download();
      downloadTruncate = res;
      assert.notDeepEqual(res.length, 0, 'returned array empty: expected at least one line');
      // all of timestamps of lines must be within value which caller intended
      for (line of res) {
        assert.ok(truncate.start <= line.timestamp && line.timestamp < truncate.end, `timestamp is out of range of what expected: ${line.timestamp}, exp: ${truncate.start} -> ${truncate.end}`);
      }
    });
  });
  describe('stream', function() {
    it('normal', async function() {
      this.timeout(20000);
      const req = client.filter(params);
      const stream = req.stream();
      let count = 0;
      for await (line of stream) {
        assert.deepEqual(line.timestamp, downloadParams[count].timestamp, `this line is different between download and stream:\n${line.timestamp}\n${downloadParams[count].timestamp}`);
        count += 1;
      }
      assert.deepEqual(count, downloadParams.length, 'line count is different');
    });
    it('multiple shard', async function() {
      this.timeout(20000);
      const req = client.filter(truncate);
      const stream = req.stream();
      let count = 0;
      for await (line of stream) {
        assert.deepEqual(line.timestamp, downloadTruncate[count].timestamp, `this line is different between download and stream:\n${line.timestamp}\n${downloadTruncate[count].timestamp}`);
        count += 1;
      }
      assert.deepEqual(count, downloadTruncate.length, 'line count is different');
    });
  });
});