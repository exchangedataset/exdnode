import { Stream } from 'stream';
import readline from 'readline';

import { readString, httpsGet } from './utils';

/**
 * Enum of line type.
 *
 * Line type shows what type of a line it is, such as message line or start line.
 * Lines with different types contain different information and have to be treated differently.
 */
export const LineType = Object.freeze({
  MSG: 1,
  SEND: 2,
  START: 3,
  END: 4,
  ERROR: 5,
});

/**
 * Convert a string representation of line type to pseudo enum.
 * @param {MessageType} type String representation of line type.
 * @returns {LineType} Pseudo enum value of an inputted line type.
 */
const convertLineType = (type) => {
  switch (type) {
    case 'msg':
      return LineType.MSG;
    case 'send':
      return LineType.SEND;
    case 'start':
      return LineType.START;
    case 'end':
      return LineType.END;
    case 'err':
      return LineType.ERROR;
    default:
      throw new Error(`Message type unknown: ${type}`);
  }
};

/**
 * Read lines and process each line to an easily manipulatable data structure.
 * @param {Stream} stream Object which extends Stream class to read lines from
 * @returns {any[][]} An array:
 * [pseudo line type enum, timestamp in nano second, ...data if this line type carries]
 * @throws TypeError If parameter did not extend Stream class.
 */
const readAndProcessLines = (stream) => {
  if (!(stream instanceof Stream)) throw new TypeError('An parameter "stream" must extend Stream class');
  return new Promise((resolve, reject) => {
    const lineStream = readline.createInterface({
      input: stream,
    });
    const lineArr = [];
    lineStream.on('line', (line) => {
      const split = line.split('\t', 4);
      const type = convertLineType(line[0]);
      const timestamp = BigInt(split[1]);
      if (type === LineType.MSG || type === LineType.SEND) {
        const channel = split[2];
        const msg = split[3];
        lineArr.push([type, timestamp, channel, msg]);
      } else if (type === LineType.END || type === LineType.ERROR) {
        const msg = split[2];
        lineArr.push([type, timestamp, msg]);
      } else {
        lineArr.push([type, timestamp]);
      }
    });
    lineStream.on('error', (error) => reject(error));
    lineStream.on('end', () => resolve(lineArr));
  });
};

/**
 * A shard is a list of datasets contains a minute worth of data.
 * Use this class to fetch a shard from server and read with ease.
 */
export default class Shard {
  constructor({
    apikey,
    exchange,
    minute,
    channels,
  }) {
    if (typeof apikey !== 'string') throw new TypeError('A parameter \'apikey\' must be of string type');
    if (typeof exchange !== 'string') throw new TypeError('A parameter \'exchange\' must be of string type');
    if (typeof minute !== 'number') throw new TypeError('A parameter \'minute\' must be of number type');
    if (!Number.isInteger(minute)) throw new TypeError('A parameter \'minute\' must be integer');
    if (!Array.isArray(channels)) throw new TypeError('A parameter \'channels\' must be of number type');
    this.apikey = apikey;
    this.exchange = exchange;
    this.minute = minute;
    this.channels = channels;
    this.downloaded = false;
  }

  async download() {
    const res = await httpsGet(this.apikey, `/filter/${this.exchange}/${this.minute}`, { channels: this.channels });

    /* check status code and content-type header */
    const { statusCode, headers } = res;
    // 200 = ok, 404 = database not found
    if (statusCode !== 200 && statusCode !== 404) {
      const obj = JSON.parse(await readString(res));
      const error = obj.error || obj.message || obj.Message;
      throw new Error(`Request failed: ${error}\nPlease check the internet connection and the remaining quota of your API key`);
    }
    const contentType = headers['content-type'];
    if (contentType !== 'text/plain') {
      throw new Error(`Invalid response content-type, expected: 'text/plain' got: '${contentType}'`);
    }

    /* read lines from the response stream and store it in a class member */
    this.lines = await readAndProcessLines(res);
    this.downloaded
  }
}
