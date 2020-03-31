/**
 * @internal
 * @packageDocumentation
 */

import { Line } from "../../common/line";
import { Filter, checkParamFilter } from "../../common/param";
import { FilterParam, FilterRequest } from "./filter";
import { convertDatetimeParam } from "../../utils/datetime";
import { ClientSetting } from "../../client/impl";
import filterDownload from "./download";
import StreamIterator from "./stream/iterator";

export type Shard = Line[];
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

  checkParamFilter(param);
  if (!('format' in param)) throw new Error('"format" was not specified.');
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

export class FilterRequestImpl implements FilterRequest {
  constructor(private clientSetting: ClientSetting, private setting: FilterSetting) {}

  async download(): Promise<Line[]> {
    return filterDownload(this.clientSetting, this.setting);
  }

  stream(bufferSize?: number): AsyncIterable<Line> {
    const clientSetting = this.clientSetting;
    const setting = this.setting;
    return {
      [Symbol.asyncIterator](): AsyncIterator<Line> {
        return new StreamIterator(clientSetting, setting, bufferSize);
      },
    };
  }
}
