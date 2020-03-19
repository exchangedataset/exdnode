import { FilterLine, FilterRequest, FilterParam, Filter } from "./filter";
import { convertNanosecToMinute, convertDatetimeParam } from "../utils/datetime";
import { downloadShard } from "./common";
import FilterStreamIterator from "./stream_iterator";
import { ClientSetting } from "../client/impl";

export type FilterSetting = {
  filter: Filter;
  start: bigint;
  end: bigint;
}

export function setupSetting(params: FilterParam): FilterSetting {
  const start = convertDatetimeParam(params.start);
  let end = convertDatetimeParam(params.end);
  if (typeof params.end === 'number') {
    // if end is in minute, that means end + 60 seconds (exclusive)
    // adding 60 seconds
    end += BigInt('60') * BigInt('1000000000');
  }
  // end in nanosec is exclusive
  end -= BigInt('1');

  // deep copy filter parameter
  const filter = JSON.parse(JSON.stringify(params.filter));

  // must return new object so it won't be modified externally
  return {
    filter,
    start,
    end,
  };
}

export class FilterRequestImpl implements FilterRequest {
  constructor(private clientSetting: ClientSetting, private setting: FilterSetting) {}

  async download(): Promise<FilterLine[]> {
    const startMinute = convertNanosecToMinute(this.setting.start);
    const endMinute = convertNanosecToMinute(this.setting.end);

    const promises: Promise<FilterLine[]>[] = [];
    for (let minute = startMinute; minute <= endMinute; minute += 1) {
      promises.push(downloadShard(
        this.clientSetting,
        this.setting,
        minute,
      ));
    }

    return Promise.all(promises)
      .then((shards: FilterLine[][]) => ([] as FilterLine[]).concat(...shards));
  }

  stream(bufferSize?: number): AsyncIterable<FilterLine> {
    const clientSetting = this.clientSetting;
    const setting = this.setting;
    return {
      [Symbol.asyncIterator](): AsyncIterator<FilterLine> {
        return new FilterStreamIterator(clientSetting, setting, bufferSize);
      },
    };
  }
}
