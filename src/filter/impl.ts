import { FilterLine, FilterRequest, FilterParam } from "./filter";
import { convertNanosecToMinute, convertDatetimeParam } from "../utils/datetime";
import { downloadShard } from "./common";
import FilterStream from "./stream";
import { ClientSetting } from "../client/impl";

export type FilterSetting = {
  exchange: string;
  start: bigint;
  end: bigint;
  channels: string[];
}

export function setupSetting(params: FilterParam): FilterSetting {
  const start = convertDatetimeParam(params.start);
  const end = convertDatetimeParam(params.end);

  // must return new object so it won't be modified externally
  return {
    exchange: params.exchange,
    start,
    end,
    channels: params.channels.slice(0),
  };
}

export class FilterRequestImpl implements FilterRequest {
  constructor(private clientSetting: ClientSetting, private setting: FilterSetting) {}

  async download(): Promise<FilterLine[]> {
    const startMinute = convertNanosecToMinute(this.setting.start);
    const endMinute = convertNanosecToMinute(this.setting.end);

    const promises: Promise<FilterLine[]>[] = [];
    for (let minute = startMinute; minute < endMinute; minute += 1) {
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
    return FilterStream.create(this.clientSetting, this.setting, bufferSize);
  }
}
