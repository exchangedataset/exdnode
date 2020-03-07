import { FilterParam, FilterLine } from "./filter";
import { convertNanosecToMinute } from "../utils/datetime";
import { downloadShard } from "./common";
import FilterStream from "./stream";

export default class FilterRequestImpl {
  constructor(private param: FilterParam) {}

  async downloadAsArray(): Promise<FilterLine[]> {
    const startMinute = convertNanosecToMinute(this.param.start);
    const endMinute = convertNanosecToMinute(this.param.end);

    const promises: Promise<FilterLine[]>[] = [];
    for (let minute = startMinute; minute < endMinute; minute += 1) {
      promises.push(downloadShard(
        this.param,
        minute,
      ));
    }
    return Promise.all(promises).then((shards: FilterLine[][]) => [].concat(shards));
  }

  async stream(bufferSize?: number): Promise<AsyncIterable<FilterLine>> {
    return FilterStream.create(this.param, bufferSize);
  }
}
