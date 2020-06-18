const assert = require('assert');
const { createClient } = require('../lib/index');
const { convertAnyDateTime } = require('../lib/utils/datetime')
const { APIKEY } = require('./constants');

describe('RawRequest', function() {
  const client = createClient({ apikey: APIKEY });
  const easyReq = client.raw({
    filter: {
      bitmex: ['orderBookL2']
    },
    start: '2020-01-01 00:00:00Z',
    end: '2020-01-01 00:01:00Z',
    format: 'raw',
  });
  const hardStart = convertAnyDateTime('2020-01-01 00:00:25Z');
  const hardEnd = convertAnyDateTime('2020-01-01 00:00:35Z');
  const hardReq = client.raw({
    filter: {
      bitflyer: ['lightning_board_FX_BTC_JPY'],
      bitmex: ['orderBookL2'],
    },
    start: hardStart,
    end: hardEnd,
    format: 'raw',
  });
  let downloadParams = [];
  let downloadTruncate = [];

  describe('download', function() {
    it('normal', async function() {
      this.timeout(20000);
      const res = await easyReq.download();
      downloadParams = res;
      assert.notDeepEqual(res.length, 0, 'returned array empty: expected at least one line');
    });
    it('multiple exchanges', async function() {
      this.timeout(20000);
      const res = await hardReq.download();
      downloadTruncate = res;
      assert.notDeepEqual(res.length, 0, 'returned array empty: expected at least one line');
      // all of timestamps of lines must be within value which caller intended
      for (line of res) {
        assert.ok(hardStart <= line.timestamp && line.timestamp < hardEnd, `timestamp is out of range of what expected: ${line.timestamp}, exp: ${hardStart} to ${hardEnd}`);
        assert.deepStrictEqual(typeof line.channel, "string", "expected string as channel:"+line.channel)
        assert.deepStrictEqual(typeof line.message, "string", "expected string as message:"+line.message)
      }
    });
  });
  describe('stream', function() {
    it('normal', async function() {
      this.timeout(20000);
      let count = 0;
      for await (line of easyReq.stream()) {
        assert.deepEqual(line.timestamp, downloadParams[count].timestamp, `this line is different between download and stream:\n${line.timestamp}\n${downloadParams[count].timestamp}`);
        count += 1;
      }
      assert.deepEqual(count, downloadParams.length, 'line count is different');
    });
    it('multiple exchanges', async function() {
      this.timeout(20000);
      let count = 0;
      for await (line of hardReq.stream()) {
        assert.deepEqual(line.timestamp, downloadTruncate[count].timestamp, `this line is different between download and stream:\n${line.timestamp}\n${downloadTruncate[count].timestamp}`);
        count += 1;
      }
      assert.deepEqual(count, downloadTruncate.length, 'line count is different');
    });
  });
});
