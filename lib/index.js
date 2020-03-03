"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = void 0;

var _https = _interopRequireDefault(require("https"));

var _util = _interopRequireDefault(require("util"));

var _readline = _interopRequireDefault(require("readline"));

var _moment = _interopRequireDefault(require("moment"));

var _urlsafeBase = _interopRequireDefault(require("urlsafe-base64"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const httpsGet = (url, apikey) => new Promise((resolve, reject) => {
  _https.default.get(url, {
    headers: {
      'Authorization': `Bearer ${apikey}`
    }
  }, res => resolve(res));
});

const URL_API = 'https://e5ply8wvu9.execute-api.us-east-2.amazonaws.com/test';

const readString = stream => {
  return new Promise((resolve, reject) => {
    let chunks = [];
    stream.on('data', data => chunks.push(data));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

const getShard = async (apikey, exchange, minute) => {
  if (typeof apikey !== 'string') throw new TypeError('A parameter \'apikey\' must be of string type');
  if (typeof exchange !== 'string') throw new TypeError('A parameter \'exchange\' must be of string type');
  if (typeof minute !== 'number') throw new TypeError('A parameter \'minute\' must be of number type');
  if (!Number.isInteger(minute)) throw new TypeError('A parameter \'minute\' must be integer');
  const res = await httpsGet(`${URL_API}/filter/${exchange}/${minute}?channels=orderBookL2`, apikey);
  const {
    statusCode,
    headers
  } = res;

  if (statusCode !== 200 && statusCode !== 404) {
    const obj = JSON.parse((await readString(res)));
    const error = obj.error || obj.message || obj.Message;
    throw new Error(`Request failed: ${error}\nPlease check the internet connection and the remaining quota of your API key`);
  }

  const contentType = headers['content-type'];

  if (contentType !== 'text/plain') {
    throw new Error(`Invalid response content-type, expected: 'text/plain' got: '${contentType}'`);
  }

  return res;
};

const convertDatetimeParam = datetime => {
  if (typeof datetime === 'string') {} else if (datetime instanceof Date) {} else if (datetime instanceof Number) {} else if (datetime instanceof _moment.default.Moment) {} else {
    throw new TypeError('Unsupported datetime object');
  }
};

class Client {
  constructor(apikey) {
    if (typeof apikey !== 'string') throw new TypeError('An API key must be of string type');
    if (!_urlsafeBase.default.validate(apikey)) throw new TypeError('An API key provided is not in a url-safe base64 format');
    this.apikey = apikey;
  }

  async filter(args) {
    const {
      exchange,
      start,
      end,
      channels
    } = args;
    /* convert date into utc nanosec (extends unixtime) */
    // startNanosec = convertDatetimeParam(start);
    // endNanosec = convertDatetimeParam(end);

    const shard = await getShard(this.apikey, exchange, start); // reader.on('line', (line) => {
    //   console.log('line', line);
    // });
    // reader.on('close', () => {
    // });

    return shard;
  }

}

exports.Client = Client;