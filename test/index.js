const assert = require('assert');
const readline = require('readline');
const { Client } = require('../lib/index');

const APIKEY = 'cGpvbmtRZnF1ZGdidTJMM0dPQTY4TWw1dFl1bHNXTks';

describe('Client', function() {
  describe('new', function() {
    it('should not throw when a valid API key is given', function() {
      assert.doesNotThrow(function() {
        new Client(APIKEY);
      });
    });
    it('should not throw when a INVALID API key is given', function() {
      assert.throws(function() {
        new Client('this is invalid')
      });
    });
  });
  describe('Filter', function() {
    const client = new Client(APIKEY);

    it('Request a shard', async function() {
      this.timeout(10000);
      const res = await client.filter({
        exchange: 'bitmex',
        start: 26375331,
        end: 26375331,
      });
    });
  });
});
