import { FilterLine, FilterRequest, FilterParam, Filter } from "./filter";
import { convertDatetimeParam } from "../utils/datetime";
import { ClientSetting } from "../client/impl";
import filterDownload from "./download";
import StreamIterator from "./stream/iterator";

export type FilterSetting = {
  filter: Filter;
  start: bigint;
  end: bigint;
}
export type Shard = FilterLine[];

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
