/**
 * @internal
 * @packageDocumentation
 */

import { FilterLine, FilterRequest, FilterParam, Filter } from "../filter";
import { convertDatetimeParam } from "../../utils/datetime";
import { ClientSetting } from "../../client/impl";
import filterDownload from "../download";
import StreamIterator from "../stream/iterator";

export type FilterSetting = {
  filter: Filter;
  start: bigint;
  end: bigint;
  format: string;
}
export type Shard = FilterLine[];

export function setupSetting(params: FilterParam): FilterSetting {
  if (!('start' in params)) throw new Error('"start" date time was not specified.');
  if (!('end' in params)) throw new Error('"end" date time was not specified.');
  // type check for those parameter will be done in convertDatetimeParam function

  if (!('filter' in params)) throw new Error('"filter" is undefined, there must be at least one channel to filter.');
  if (Object.keys(params.filter).length === 0) throw new Error('"filter" must contain at least one channel to filter, found no exchange.');
  for (const [exchange, channels] of Object.entries(params.filter)) {
    if (typeof exchange !== 'string') throw new Error(`"filter" must have exchange as key which is string, found ${typeof exchange}.`);
    if (!Array.isArray(channels)) throw new Error(`"filter.${exchange}" must be an array of channels.`);
    if (!channels.every((ch) => typeof ch === 'string')) throw new Error(`Channels for ${exchange} must be of string type, at least one of them wasn't.`);
  }
  if (!('format' in params)) throw new Error('"format" was not specified.');
  if (typeof params.format !== 'string') throw new Error('"format" must be of string type');

  const start = convertDatetimeParam(params.start);
  let end = convertDatetimeParam(params.end);
  if (typeof params.end === 'number') {
    // if end is in minute, that means end + 60 seconds (exclusive)
    // adding 60 seconds
    end += BigInt('60') * BigInt('1000000000');
  }
  // end in nanosec is exclusive
  end -= BigInt('1');

  if (end <= start) {
    throw new Error('Invalid date time range "end" <= "start"');
  }

  // deep copy filter parameter
  const filter = JSON.parse(JSON.stringify(params.filter));

  // must return new object so it won't be modified externally
  return {
    filter,
    start,
    end,
    format: params.format,
  };
}

export class FilterRequestImpl implements FilterRequest {
  constructor(private clientSetting: ClientSetting, private setting: FilterSetting) {}

  download(): Promise<FilterLine[]> {
    return filterDownload(this.clientSetting, this.setting);
  }

  stream(bufferSize?: number): AsyncIterable<FilterLine> {
    const clientSetting = this.clientSetting;
    const setting = this.setting;
    return {
      [Symbol.asyncIterator](): AsyncIterator<FilterLine> {
        return new StreamIterator(clientSetting, setting, bufferSize);
      },
    };
  }
}
