const assert = require('assert');
const { createClient, replay } = require('../lib/index');
const { APIKEY } = require('./constants');

describe('ReplayRequestBuilder', function() {
  const client = createClient({ apikey: APIKEY });

  it('throws if no filter was provided', function() {
    assert.throws(function () {
      client.replay().build();
    });
  });
  it('throws if channels are not provided', function() {
    assert.throws(function () { client.replay().build() });
  });
  it('throws if start was not provided', function() {
    assert.throws(function () {
      client.replay()
        .bitmex(
          replay.bitmex()
            .orderBookL2(["XBTUSD"])
            .build()
        )
        .build();
    });
  });
  it('throws if end was not provided', function() {
    assert.throws(function () {
      client.replay()
        .bitmex(
          replay.bitmex()
            .orderBookL2(["XBTUSD"])
            .build()
        )
        .start(0)
        .build();
    });
  });
  it('using range', function() {
    client.replay()
      .bitmex(
        replay.bitmex()
          .orderBookL2(["XBTUSD"])
          .build()
      )
      .range(0, 1)
      .build();
  });
  it('throw if start and end are the same', function() {
    assert.throws(function () {
      client.replay()
        .bitmex(
          replay.bitmex()
            .orderBookL2(["XBTUSD"])
            .build()
        )
        .range(BigInt(1), BigInt(1))
        .build();
    });
  });
  it('throw if start and end are the backwards', function() {
    assert.throws(function () {
      client.replay()
        .bitmex(
          replay.bitmex()
            .orderBookL2(["XBTUSD"])
            .build()
        )
        .range(5, 4)
        .build();
    });
  });
  it('build', function() {
    client.replay()
      .bitmex(
        replay.bitmex()
          .orderBookL2(["XBTUSD"])
          .build()
      )
      .start(0)
      .end(1)
      .build();
  });
})
