/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ReplayMessage } from "./replay";
import { Line } from "../common/line";
import { ClientSetting } from "../client/impl";
import { ReplayRequestSetting, convertReplayFilterToRawFilter } from "./impl";
import { RawRequestImpl } from "../raw/impl";
import RawLineProcessor from "./common";


export class ReplayStreamIterator implements AsyncIterator<Line<ReplayMessage>> {
  private rawItr: AsyncIterator<Line<string>>;
  private processor: RawLineProcessor;
  private postFilter: { [key: string]: Set<string> } = {};

  constructor(private clientSetting: ClientSetting, private setting: ReplayRequestSetting, bufferSize?: number) {
    const req = new RawRequestImpl(this.clientSetting, {
      filter: convertReplayFilterToRawFilter(this.setting.filter),
      start: this.setting.start,
      end: this.setting.end,
      format: "json",
    });
    this.rawItr = req.stream(bufferSize)[Symbol.asyncIterator]();
    // it needs to post filter
    for (const [exchange, channels] of Object.entries(setting.filter)) {
      this.postFilter[exchange] = new Set();
      for (const channel of channels) {
        this.postFilter[exchange].add(channel);
      }
    }
    this.processor = new RawLineProcessor();
  }
  
  async next(): Promise<IteratorResult<Line<ReplayMessage>>> {
    while (true) {
      const nx = await this.rawItr.next();
      if (nx.done) {
        return {
          done: true,
          value: null,
        };
      }
      const line = nx.value;
  
      const processed = this.processor.processRawLines(line);

      if (processed === null) {
        continue;
      }

      if (this.postFilter[processed.exchange].has(processed.channel!)) {
        return {
          done: false,
          value: processed,
        };
      }
    }
  }
}