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
  describe('filter', function() {
    it('creates filter builder', function() {
      let builder;
      assert.doesNotThrow(function () {
        builder = exds.createClient({ apikey: APIKEY }).http.filter();
      });
      assert.ok('configure' in builder, 'unexpected object');
    });
  });
});
