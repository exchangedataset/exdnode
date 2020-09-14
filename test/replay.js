const assert = require('assert');
const { createClient, replay } = require('../lib/index');
const { APIKEY } = require('./constants');

describe('Replay', function() {
  const client = createClient({ apikey: APIKEY });
  const easyReq = client.replay({
    filter: {
      bitmex: ['orderBookL2_XBTUSD']
    },
    start: '2020-01-01 00:00:00Z',
    end: '2020-01-01 00:01:00Z',
  });
  let easy;

  it('download', async function() {
    this.timeout(20000);
    easy = await easyReq.download();
    assert.notDeepEqual(easy.length, 0, 'returned array empty: expected at least one line');
  });
  it('stream', async function() {
    this.timeout(20000);
    const stream = easyReq.stream();
    let count = 0;
    for await (const line of stream) {
      assert.deepStrictEqual(easy[count].message, line.message, 'line is different');
      assert.deepStrictEqual(typeof line.channel, "string", "expected string as channel:"+line.channel)
      assert.ok(typeof line.message === "object" || typeof line.message === "string", "expected string or object as a message:"+JSON.stringify(line.message))
      count++;
    }
    assert.deepStrictEqual(count, easy.length, 'line count is different');
  });
})
