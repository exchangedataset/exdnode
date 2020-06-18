const assert = require('assert');
const exds = require('../lib/index');
const { APIKEY } = require('./constants');

describe('Client', function() {
  describe('createClient', function() {
    it('should not throw when a valid API key is given', function() {
      assert.doesNotThrow(function() {
        exds.createClient({ apikey: APIKEY });
      });
    });
    it('should throw when a INVALID API key is given', function() {
      assert.throws(function() {
        exds.createClient({ apikey: 'this is invalid' })
      });
    });
  });
  describe('raw', function() {
    it('creates raw request', function() {
      let request;
      assert.doesNotThrow(function () {
        request = exds.createClient({ apikey: APIKEY }).raw({
          filter: {
            bitmex: ['orderBookL2']
          },
          start: 0,
          end: 0,
          format: 'raw',
        });
      });
      assert.ok('download' in request, 'unexpected object');
    });
  });
  describe('replay', function() {
    it('creates replay request', function() {
      let builder;
      assert.doesNotThrow(function () {
        builder = exds.createClient({ apikey: APIKEY }).replay({
          filter: {
            bitmex: ['orderBookL2'],
          },
          start: 0,
          end: 0,
          format: 'raw',
        });
      });
      assert.ok('download' in builder, 'unexpected object');
    });
  });
});
