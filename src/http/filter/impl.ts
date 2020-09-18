/**
 * @internal
 * @packageDocumentation
 */

import readline from 'readline';
import { Line, Shard, LineType } from "../../common/line";
import { FilterParam } from "./filter";
import { convertAnyDateTime, convertAnyMinute } from "../../utils/datetime";
import { ClientSetting } from "../../client/impl";
import { getResponse } from "../../common/download";
import { ParsedUrlQueryInput } from 'querystring';

export type FilterSetting = {
  exchange: string;
  channels: string[];
  minute: number;
  start?: bigint;
  end?: bigint;
  format?: string;
}

export function setupFilterSetting(param: FilterParam): FilterSetting {
  if (!('exchange' in param)) throw new Error('"exchange" was not specified');
  if (!('channels' in param)) throw new Error('"channels" was not specified');
  if (!Array.isArray(param.channels)) throw new TypeError('"channels" must be an array of string');
  for (const ch of param.channels) {
    if (typeof ch !== 'string') throw new Error('element of "channels" must be of string type');
  }
  // deep copy channels parameter
  const channels = JSON.parse(JSON.stringify(param.channels));
  if (!('minute' in param)) throw new Error('"minute" was not specified');
  const setting: FilterSetting = {
    exchange: param.exchange,
    channels,
    minute: convertAnyMinute(param.minute),
  };
  if ('start' in param) {
    setting.start = convertAnyDateTime(param.start);
  }
  if ('end' in param) {
    let end = convertAnyDateTime(param.end);
    if (typeof param.end === 'number') {
      // if end is in minute, that means end + 60 seconds (exclusive)
      // adding 60 seconds
      end += BigInt('60') * BigInt('1000000000');
    }
    if (typeof setting.start !== 'undefined' && end <= setting.start) {
      throw new Error('Invalid date time range "end" <= "start"');
    }
    setting.end = end;
  }
  if ('format' in param) {
    if (typeof param.format !== 'string') throw new Error('"format" must be of string type');
    setting.format = param.format;
  }
  return setting;
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

async function readLines(exchange: string, stream: NodeJS.ReadableStream): Promise<Line<string>[]> {
  return new Promise((resolve, reject) => {
    const lineStream = readline.createInterface({
      input: stream,
    });
    const lineArr: Line<string>[] = [];
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
    stream.on('error', (error: Error) => reject(new Error(`Catched upper stream error: ${error.message}`)));
    lineStream.on('error', (error: Error) => reject(new Error(`Catched line stream error: ${error.message}`)));
    lineStream.on('close', () => resolve(lineArr));
  });
}

export async function _filter(clientSetting: ClientSetting, setting: FilterSetting): Promise<Shard<string>> {
  // request and download
  const query: ParsedUrlQueryInput = {
    channels: setting.channels,
    format: setting.format,
  }
  if (typeof setting.start !== 'undefined') {
    query.start = setting.start.toString();
  }
  if (typeof setting.end !== 'undefined') {
    query.end = setting.end.toString();
  }
  const res = await getResponse(
    clientSetting,
    `filter/${setting.exchange}/${setting.minute}`,
    query,
  );

  // process stream to get lines
  let lines: Line<string>[] = [];
  if (res.statusCode === 200) {
    // read lines from the response stream
    lines = await readLines(setting.exchange, res.stream);
  }
  res.stream.destroy();

  return lines;
}
