import readline from 'readline';

import { readString, httpsGet } from '../utils/stream';
import { APIResponse } from "../client";

/**
 * Enum of line type.
 *
 * Line type shows what type of a line it is, such as message line or start line.
 * Lines with different types contain different information and have to be treated differently.
 */
export enum LineType {
  MSG = 1,
  SEND,
  START,
  END,
  ERROR,
};

function convertLineType(type: string): LineType {
  switch (type) {
    case 'ms':
      return LineType.MSG;
    case 'se':
      return LineType.SEND;
    case 'st':
      return LineType.START;
    case 'en':
      return LineType.END;
    case 'er':
      return LineType.ERROR;
    default:
      throw new Error(`Message type unknown: ${type}`);
  }
};

export type FilterLine = {
  type: LineType,
  timestamp: bigint,
  channel?: string,
  message?: string,
};

export class FilterResponse implements APIResponse<FilterLine> {
  constructor(private lines: [bigint, string][]) {
  }

  raw(): [bigint, string][] {
    return this.lines;
  }

  [Symbol.iterator](): Iterator<FilterLine, any, undefined> {
    const self = this;
    let position = 0;
    const iterator = {
      next(): IteratorResult<FilterLine> {
        const ret = this.return(position);
        position += 1;
        return ret;
      },
      return(value: number): IteratorResult<FilterLine> {
        const arr = self.lines[value];
        const line = arr[1];
        const type = convertLineType(line.slice(0, 2));
        const timestamp = arr[0];
        let channel = null;
        let message = null;
        if (type === LineType.MSG || type === LineType.SEND) {
          // message or send have 4 section
          const split = line.split('\t', 4);
          channel = split[2];
          message = split[3];
          return {
            done: value >= self.lines.length,
            value: { type, timestamp, channel, message },
          }
        } else if (type === LineType.START || type === LineType.ERROR) {
          // start or error have 3 section without channel
          const split = line.split('\t', 3);
          message = split[2];
          return {
            done: value >= self.lines.length,
            value: { type, timestamp, message },
          }
        }
        // it has no additional information
        return {
          done: value >= self.lines.length,
          value: { type, timestamp },
        }
      }
    }
    return iterator;
  }
}


/**
 * Read lines and process each line to an easily manipulatable data structure.
 * @param stream Object which extends Stream class to read lines from
 * @returns An array:
 * [line type, timestamp in nano second, ...data if this line type carries]
 * @throws TypeError If parameter did not extend Stream class.
 */
function readLines(stream: NodeJS.ReadableStream): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const lineStream = readline.createInterface({
      input: stream,
    });
    const lineArr: any[][] = [];
    lineStream.on('line', (line) => {
      const split = line.split('\t', 3);
      const timestamp = BigInt(split[1]);
    });
    lineStream.on('error', (error) => reject(error));
    lineStream.on('end', () => resolve(lineArr));
  });
};

async function downloadShard(apikey: string, exchange: string, minute: number, channels: string[]): Promise<string[]> {
  const res = await httpsGet(apikey, `/filter/${exchange}/${minute}`, { channels });

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

  if (statusCode === 200) {
    /* read lines from the response stream and store it in a class member */
    return await readLines(res);
  }
  res.destroy();
  // statusCode === 404
  return [];
};
