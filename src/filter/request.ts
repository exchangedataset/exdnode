import FilterStream from "./stream";
import { FilterLine } from "./common";

export default class FilterRequestImpl {
  constructor(private param: FilterParam) {}

  async downloadAsArray(): Promise<FilterLine[]> {
    let downloaded: FilterLine[][] = [];

    let minute = convertNanosecToMinute(this.param.start);
    
    await downloadShard(
      this.param.clientSetting.apikey,
      this.param.exchange,
      minute,
      this.param.channels,
      this.param.clientSetting.timeout,
    );
  }

  async stream(bufferSize?: number): Promise<AsyncIterable<FilterLine>> {
    return FilterStream.create(this.param, bufferSize);
  }
}
