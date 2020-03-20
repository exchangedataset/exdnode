const assert = require('assert');
const exds = require('../lib/index');
const { APIKEY } = require('./constants');

describe('FilterBuilder', function() {
  const client = exds.createClient({ apikey: APIKEY });

  it('throws if no filter was provided', function() {
    assert.throws(function () {
      client.filter().build();
    });
  });
  it('throws if channels are not provided', function() {
    assert.throws(function () { client.filter().bitmex() });
    assert.throws(function () { client.filter().bitflyer() });
    assert.throws(function () { client.filter().bitfinex() });
  });
  it('throws if start was not provided', function() {
    assert.throws(function () {
      client.filter().bitmex(
        filterBitmex()
          .orderBookL2()
          .build()
      ).build();
    });
  });
  it('throws if end was not provided', function() {
    assert.throws(function () {
      client.filter().build();
    });
  });
  it('builds filter', function() {
    client.filter().bitmex(filterBitmex().orderBookL2().build())
    
    const params = {
      filter: filterBuilder().bitmex(filterBitmex().orderBookL2().build()).build(),
    }
  });
})
