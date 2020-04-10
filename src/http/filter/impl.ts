/**
 * @internal
 * @packageDocumentation
 */

import readline from 'readline';
import { Line, Shard, LineType } from "../../common/line";
import { FilterParam } from "./filter";
import { convertDatetimeParam } from "../../utils/datetime";
import { ClientSetting } from "../../client/impl";
import { getResponse } from "../../common/download";

export type FilterSetting = {
  exchange: string;
  channels: string[];
  start: bigint;
  end: bigint;
  minute: number;
  format: string;
}

export function setupFilterRequestSetting(param: FilterParam): FilterSetting {
  if (!('start' in param)) throw new Error('"start" date time was not specified');
  if (!('end' in param)) throw new Error('"end" date time was not specified');
  // type check for those parameter will be done in convertDatetimeParam function

  if (!('exchange' in param)) throw new Error('"exchange" was not specified');
  if (!('channels' in param)) throw new Error('"channels" was not specified');
  for (const ch of param.channels) {
    if (typeof ch !== 'string') throw new Error('element of "channels" must be of string type');
  }
  if (!('minute' in param)) throw new Error('"minute" was not specified');
  if (typeof param.minute !== 'number') throw new Error('"minute" must be of number type');
  if (!Number.isInteger(param.minute)) throw new Error('"minute" must be of integer');
  if (!('format' in param)) throw new Error('"format" was not specified');
  if (typeof param.format !== 'string') throw new Error('"format" must be of string type');

  const start = convertDatetimeParam(param.start);
  let end = convertDatetimeParam(param.end);
  if (typeof param.end === 'number') {
    // if end is in minute, that means end + 60 seconds (exclusive)
    // adding 60 seconds
    end += BigInt('60') * BigInt('1000000000');
  }

  if (end <= start) {
    throw new Error('Invalid date time range "end" <= "start"');
  }

  // deep copy channels parameter
  const channels = JSON.parse(JSON.stringify(param.channels));

  // must return new object so it won't be modified externally
  return {
    exchange: param.exchange,
    channels,
    start,
    end,
    minute: param.minute,
    format: param.format,
  };
}

function convertLineType(type: string): LineType {
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

async function readLines(exchange: string, stream: NodeJS.ReadableStream): Promise<Line[]> {
  return new Promise((resolve, reject) => {
    const lineStream = readline.createInterface({
      input: stream,
    });
    const lineArr: Line[] = [];
    lineStream.on('line', (line: string) => {
      const prefix = line.slice(0, 2);
      let split;
      switch (prefix) {
        case 'ms':
          // message or send have 4 section
          split = line.split('\t', 4);
          lineArr.push({
            exchange,
            type: LineType.MESSAGE,
            timestamp: BigInt(split[1]),
            channel: split[2],
            message: split[3],
          });
          break;
        case 'se':
          split = line.split('\t', 4);
          lineArr.push({
            exchange,
            type: LineType.SEND,
            timestamp: BigInt(split[1]),
            channel: split[2],
            message: split[3],
          });
          break;
        case 'st':
          // start or error have 3 section without channel
          split = line.split('\t', 3);
          lineArr.push({
            exchange,
            type: LineType.START,
            timestamp: BigInt(split[1]),
            message: split[2]
          });
          break;
        case 'er':
          split = line.split('\t', 3);
          lineArr.push({
            exchange,
            type: LineType.ERROR,
            timestamp: BigInt(split[1]),
            message: split[2]
          });
          break;
        default:
          split = line.split('\t', 2);
          // it has no additional information
          lineArr.push({
            exchange,
            type: convertLineType(split[0]),
            timestamp: BigInt(split[1])
          });
          break;
      }
    });
    lineStream.on('error', (error: Error) => reject(error));
    lineStream.on('close', () => resolve(lineArr));
  });
}

export async function filterDownload(clientSetting: ClientSetting, setting: FilterSetting): Promise<Shard> {
  // request and download
  const res = await getResponse(
    clientSetting,
    `filter/${setting.exchange}/${setting.minute}`,
    {
      channels: setting.channels,
      start: setting.start.toString(),
      end: setting.end.toString(),
      format: setting.format,
    },
  );

  // process stream to get lines
  let lines: Line[] = [];
  if (res.statusCode === 200) {
    /* read lines from the response stream */
    lines = await readLines(setting.exchange, res.stream);
  }
  res.stream.destroy();

  return lines;
}
