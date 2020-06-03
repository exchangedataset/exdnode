const assert = require('assert');
const { createClient, replay } = require('../lib/index');
const { APIKEY } = require('./constants');

describe('Massive', function() {
  const client = createClient({ apikey: APIKEY });

  it('bitmex', async function() {
    this.timeout(200000000);
    const easyReq = client.replay()
      .bitmex(
        replay.bitmex()
          .orderBookL2(["XBTUSD", "ETHUSD"])
          .trade(["XBTUSD", "ETHUSD"])
          .instrument(["XBTUSD", "ETHUSD"])
          .liquidation(["XBTUSD", "ETHUSD"])
          .settlement(["XBTUSD", "ETHUSD"])
          .insurance(["XBTUSD", "ETHUSD"])
          .funding(["XBTUSD", "ETHUSD"])
          .build()
      )
      .range('2020/1/1 12:00:00', '2020/1/2 00:00:00')
      .build();
    const stream = easyReq.stream();
    for await (const line of stream) {
    }
  });
  it('bitflyer', async function() {
    this.timeout(200000000);
    const easyReq = client.replay()
      .bitflyer(
        replay.bitflyer()
          .ticker(["FX_BTC_JPY", "BTC_JPY"])
          .executions(["FX_BTC_JPY", "BTC_JPY"])
          .board(["FX_BTC_JPY", "BTC_JPY"])
          .boardSnapshot(["FX_BTC_JPY", "BTC_JPY"])
          .build()
      )
      .range('2020/1/1 12:00:00', '2020/1/2 00:00:00')
      .build();
    const stream = easyReq.stream(50);
    for await (const line of stream) {
    }
  });
  it('bitfinex', async function() {
    this.timeout(200000000);
    const easyReq = client.replay()
      .bitfinex(
        replay.bitfinex()
          .trades(["tBTCUSD", "tETHUSD"])
          .book(["tBTCUSD", "tETHUSD"])
          .build()
      )
      .range('2020/1/1 12:00:00', '2020/1/2 00:00:00')
      .build();
    const stream = easyReq.stream();
    for await (const line of stream) {
    }
  });
})
