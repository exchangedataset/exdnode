import readline from 'readline';

import { readString, httpsGet } from '../utils/stream';
import { LineType, FilterLine } from './filter';
import { ClientSetting } from '../client/impl';
import { FilterSetting } from './impl';

export function convertLineType(type: string): LineType {
  switch (type) {
    case 'ms':
      return LineType.MESSAGE;
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
}

/**
 * Read lines and process each line to an easily manipulatable data structure.
 * @param stream Object which extends Stream class to read lines from
 * @returns An array:
 * [line type, timestamp in nano second, ...data if this line type carries]
 * @throws TypeError If parameter did not extend Stream class.
 */
async function readLines(stream: NodeJS.ReadableStream): Promise<FilterLine[]> {
  return new Promise((resolve, reject) => {
    const lineStream = readline.createInterface({
      input: stream,
    });
    const lineArr: FilterLine[] = [];
    lineStream.on('line', (line) => {
      const type = convertLineType(line.slice(0, 2));
      if (type === LineType.MESSAGE || type === LineType.SEND) {
        // message or send have 4 section
        const split = line.split('\t', 4);
        const timestamp = BigInt(split[1]);
        const channel = split[2];
        const message = split[3];
        lineArr.push({
          type, timestamp, channel, message,
        });
      } else if (type === LineType.START || type === LineType.ERROR) {
        // start or error have 3 section without channel
        const split = line.split('\t', 3);
        const timestamp = BigInt(split[1]);
        const message = split[2];
        lineArr.push({ type, timestamp, message });
      }
      const split = line.split('\t', 2);
      const timestamp = BigInt(split[1]);
      // it has no additional information
      lineArr.push({ type, timestamp });
    });
    lineStream.on('error', (error) => reject(error));
    lineStream.on('end', () => resolve(lineArr));
  });
}

export async function downloadShard(
  clientSetting: ClientSetting,
  filterParams: FilterSetting,
  minute: number,
): Promise<FilterLine[]> {
  const res = await httpsGet(
    clientSetting,
    `/filter/${filterParams.exchange}/${minute}`,
    { channels: filterParams.channels },
  );

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

  let lines: FilterLine[] = [];
  if (statusCode === 200) {
    /* read lines from the response stream and store it in a class member */
    lines = await readLines(res);
  }
  res.destroy();
  return lines;
}
