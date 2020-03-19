import { FilterLine, FilterRequest, FilterParam, Filter, Exchange } from "./filter";
import { convertNanosecToMinute, convertDatetimeParam } from "../utils/datetime";
import { downloadShard } from "./common";
import FilterStreamIterator from "./stream_iterator";
import { ClientSetting } from "../client/impl";
import { downloadAllShards } from "./download";

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

  async download(): Promise<FilterLine[]> {
    // download all shards, returns an array of shards for each exchange
    const map = await downloadAllShards(this.clientSetting, this.setting);
    // stores reading position for each exchange
    const positions = Object.fromEntries(Object.entries(map).flatMap(([exchange, shards]) => {
      while (shards!.length > 0 && 0 === shards![0].length) shards!.shift();
      if (shards!.length > 0) {
        return [
          [exchange, 0]
        ];
      } else {
        // there was no line, this empty array will be flattened and represents nothing
        return [];
      }
    })) as { [key in Exchange]?: number };
    const exchanges = Object.keys(positions) as Exchange[];

    /* it needs to process lines so that it becomes a single array */
    // array to store the result
    const array: FilterLine[] = []
    while (exchanges.length > 0) {
      // have to set initial value to calculate minimun value
      let argmin: number = exchanges.length-1;
      const tmpLine = (map[exchanges[argmin]]!)[0][positions[exchanges[argmin]]!];
      let min: bigint = tmpLine.timestamp;
      // must start from the end because it needs to remove its elements
      for (let i = exchanges.length - 2; i >= 0; i--) {
        const exchange = exchanges[i];
        // map[exchange] will never be undefined
        const line = (map[exchange]!)[0][positions[exchange]!];
        if (line.timestamp < min) {
          min = line.timestamp;
          argmin = i;
        }
      }
      // push the line
      array.push((map[exchanges[argmin]]!)[0][positions[exchanges[argmin]]!]);
      // find the next line for this exchange, if does not exist, remove the exchange
      const exchange = exchanges[argmin];
      positions[exchange]! += 1;
      const shards = map[exchange]!;
      while (shards.length > 0) {
        if (positions[exchange]! < shard.length) {
          break;
        }
        shards.shift();
      }
      if (shards.length > 0) {
        // next line is absent
        exchanges.splice(argmin, 1);
      }
    }

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
