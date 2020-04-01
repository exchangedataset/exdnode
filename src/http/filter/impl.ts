/**
 * @internal
 * @packageDocumentation
 */

import { Line, Shard } from "../../common/line";
import { FilterParam, FilterRequest } from "./filter";
import { convertDatetimeParam, convertNanosecToMinute } from "../../utils/datetime";
import { ClientSetting } from "../../client/impl";
import FilterStreamIterator from "./stream/iterator";
import { downloadFilterShard } from "./common";

export type FilterSetting = {
  exchange: string;
  channels: string[];
  start: bigint;
  end: bigint;
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
    format: param.format,
  };
}

export class FilterRequestImpl implements FilterRequest {
  constructor(private clientSetting: ClientSetting, private setting: FilterSetting) {}

  async download(): Promise<Shard[]> {
    const proms: Promise<Shard>[] = [];

    const startMinute = convertNanosecToMinute(this.setting.start);
    const endMinute = convertNanosecToMinute(this.setting.end);

    for (let minute = startMinute; minute <= endMinute; minute++) {
      proms.push(
        downloadFilterShard(this.clientSetting,
          this.setting.exchange,
          this.setting.channels,
          this.setting.start,
          this.setting.end,
          minute,
        )
      );
    }

    return Promise.all(proms);
  }

  stream(bufferSize?: number): AsyncIterable<Line> {
    const clientSetting = this.clientSetting;
    const setting = this.setting;
    return {
      [Symbol.asyncIterator](): AsyncIterator<Line> {
        return new FilterStreamIterator(clientSetting, setting, bufferSize);
      },
    };
  }
}
