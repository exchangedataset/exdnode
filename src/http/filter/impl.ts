/**
 * @internal
 * @packageDocumentation
 */

import { FilterLine, Filter, FilterParam } from "./filter";
import { convertDatetimeParam } from "../../utils/datetime";

export type Shard = FilterLine[];
export type FilterSetting = {
  filter: Filter;
  start: bigint;
  end: bigint;
  format: string;
}

export function setupSetting(param: FilterParam): FilterSetting {
  if (!('start' in param)) throw new Error('"start" date time was not specified.');
  if (!('end' in param)) throw new Error('"end" date time was not specified.');
  // type check for those parameter will be done in convertDatetimeParam function

  if (!('filter' in param)) throw new Error('"filter" is undefined, there must be at least one channel to filter.');
  if (Object.keys(param.filter).length === 0) throw new Error('"filter" must contain at least one channel to filter, found no exchange.');
  for (const [exchange, channels] of Object.entries(param.filter)) {
    if (typeof exchange !== 'string') throw new Error(`"filter" must have exchange as key which is string, found ${typeof exchange}.`);
    if (!Array.isArray(channels)) throw new Error(`"filter.${exchange}" must be an array of channels.`);
    if (!channels.every((ch) => typeof ch === 'string')) throw new Error(`Channels for ${exchange} must be of string type, at least one of them wasn't.`);
  }
  if (!('format' in param)) throw new Error('"format" was not specified.');
  if (typeof param.format !== 'string') throw new Error('"format" must be of string type');

  const start = convertDatetimeParam(param.start);
  let end = convertDatetimeParam(param.end);
  if (typeof param.end === 'number') {
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
  const filter = JSON.parse(JSON.stringify(param.filter));

  // must return new object so it won't be modified externally
  return {
    filter,
    start,
    end,
    format: param.format,
  };
}
