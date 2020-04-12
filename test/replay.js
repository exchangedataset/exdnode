const assert = require('assert');
const { createClient, replay } = require('../lib/index');
const { APIKEY } = require('./constants');

describe('Replay', function() {
  const client = createClient({ apikey: APIKEY });
  const easyReq = client.replay()
    .bitmex(
      replay.bitmex()
        .orderBookL2(["XBTUSD"])
        .build()
    )
    .range(26430647, 26430650)
    .build();
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
      assert.deepEqual(easy[count].message, line.message, 'line is different');
      count++;
    }
    assert.deepEqual(count, easy.length, 'line count is different');
  });
})
