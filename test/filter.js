const assert = require('assert');
const { createClient } = require('../lib/index');
const { APIKEY } = require('./constants');

describe('FilterRequest', function() {
  const client = createClient({ apikey: APIKEY });
  const easyReq = client.filter().bitmex(['orderBookL2']).range(26375331).asRaw();
  const hardStart = (26375331n * 60n + 20n) * 1000000000n;
  const hardEnd = (26375332n * 60n - 25n) * 1000000000n;
  const hardReq = client.filter()
    .bitmex(['orderBookL2'])
    // cut 20 seconds after the beginning of shard
    .start(hardStart)
    // truncate 25 seconds before end of shard
    .end(hardEnd)
    .asRaw();
  let downloadParams = [];
  let downloadTruncate = [];

  describe('download', function() {
    it('normal', async function() {
      this.timeout(20000);
      const res = await easyReq.download();
      downloadParams = res;
      assert.notDeepEqual(res.length, 0, 'returned array empty: expected at least one line');
    });
    it('multiple shard', async function() {
      this.timeout(20000);
      const res = await hardReq.download();
      downloadTruncate = res;
      assert.notDeepEqual(res.length, 0, 'returned array empty: expected at least one line');
      // all of timestamps of lines must be within value which caller intended
      for (line of res) {
        assert.ok(hardStart <= line.timestamp && line.timestamp < hardEnd, `timestamp is out of range of what expected: ${line.timestamp}, exp: ${hardStart} -> ${hardEnd}`);
      }
    });
  });
  describe('stream', function() {
    it('normal', async function() {
      this.timeout(20000);
      const stream = easyReq.stream();
      let count = 0;
      for await (line of stream) {
        assert.deepEqual(line.timestamp, downloadParams[count].timestamp, `this line is different between download and stream:\n${line.timestamp}\n${downloadParams[count].timestamp}`);
        count += 1;
      }
      assert.deepEqual(count, downloadParams.length, 'line count is different');
    });
    it('multiple shard', async function() {
      this.timeout(20000);
      const stream = hardReq.stream();
      let count = 0;
      for await (line of stream) {
        assert.deepEqual(line.timestamp, downloadTruncate[count].timestamp, `this line is different between download and stream:\n${line.timestamp}\n${downloadTruncate[count].timestamp}`);
        count += 1;
      }
      assert.deepEqual(count, downloadTruncate.length, 'line count is different');
    });
  });
});
