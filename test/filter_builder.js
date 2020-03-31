const assert = require('assert');
const exds = require('../lib/index');
const { APIKEY } = require('./constants');

describe('FilterBuilder', function() {
  const client = exds.createClient({ apikey: APIKEY });

  it('throws if no filter was provided', function() {
    assert.throws(function () {
      client.http.filter().asRaw();
    });
  });
  it('throws if channels are not provided', function() {
    assert.throws(function () { client.filter().asRaw() });
  });
  it('throws if start was not provided', function() {
    assert.throws(function () {
      client.http.filter()
        .bitmex(
          exds.filterBitmex()
            .orderBookL2()
            .build()
        )
        .asRaw();
    });
  });
  it('throws if end was not provided', function() {
    assert.throws(function () {
      client.http.filter()
        .bitmex(
          exds.filterBitmex()
            .orderBookL2()
            .build()
        )
        .start(0)
        .asRaw();
    });
  });
  it('using range', function() {
    client.http.filter()
      .bitmex(
        exds.http.filterBitmex()
          .orderBookL2()
          .build()
      )
      .range(0, 1)
      .asRaw();
  });
  it('throw if start and end are the same', function() {
    assert.throws(function () {
      client.http.filter()
        .bitmex(
          exds.filterBitmex()
            .orderBookL2()
            .build()
        )
        .range(BigInt(1), BigInt(1))
        .asRaw();
    });
  });
  it('throw if start and end are the backwards', function() {
    assert.throws(function () {
      client.http.filter()
        .bitmex(
          exds.filterBitmex()
            .orderBookL2()
            .build()
        )
        .range(5, 4)
        .asRaw();
    });
  });
  it('builds filter request as raw', function() {
    client.http.filter()
      .bitmex(
        exds.filterBitmex()
          .orderBookL2()
          .build()
      )
      .start(0)
      .end(1)
      .asRaw();
  });
  it('builds filter request as scv like', function() {
    client.http.filter()
      .bitmex(
        exds.filterBitmex()
          .orderBookL2()
          .build()
      )
      .range(0, 1)
      .asCSVLike();
  });
})
