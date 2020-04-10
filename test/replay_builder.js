const assert = require('assert');
const { createClient, replay } = require('../lib/index');
const { APIKEY } = require('./constants');

describe('ReplayRequestBuilder', function() {
  const client = createClient({ apikey: APIKEY });

  it('throws if no filter was provided', function() {
    assert.throws(function () {
      client.replay().asRaw();
    });
  });
  it('throws if channels are not provided', function() {
    assert.throws(function () { client.replay().asRaw() });
  });
  it('throws if start was not provided', function() {
    assert.throws(function () {
      client.replay()
        .bitmex(
          replay.bitmex()
            .orderBookL2()
            .build()
        )
        .asRaw();
    });
  });
  it('throws if end was not provided', function() {
    assert.throws(function () {
      client.replay()
        .bitmex(
          replay.bitmex()
            .orderBookL2()
            .build()
        )
        .start(0)
        .asRaw();
    });
  });
  it('using range', function() {
    client.replay()
      .bitmex(
        replay.bitmex()
          .orderBookL2()
          .build()
      )
      .range(0, 1)
      .asRaw();
  });
  it('throw if start and end are the same', function() {
    assert.throws(function () {
      client.replay()
        .bitmex(
          replay.bitmex()
            .orderBookL2()
            .build()
        )
        .range(BigInt(1), BigInt(1))
        .asRaw();
    });
  });
  it('throw if start and end are the backwards', function() {
    assert.throws(function () {
      client.replay()
        .bitmex(
          replay.bitmex()
            .orderBookL2()
            .build()
        )
        .range(5, 4)
        .asRaw();
    });
  });
  it('builds as raw', function() {
    client.replay()
      .bitmex(
        replay.bitmex()
          .orderBookL2()
          .build()
      )
      .start(0)
      .end(1)
      .asRaw();
  });
  it('builds as scv like', function() {
    client.replay()
      .bitmex(
        replay.bitmex()
          .orderBookL2()
          .build()
      )
      .range(0, 1)
      .asCSVLike();
  });
})
