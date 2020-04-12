/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ReplayMessage } from "./replay";
import { Line } from "../common/line";
import { ClientSetting } from "../client/impl";
import { ReplayRequestSetting, convertReplayFilterToRawFilter, ReplayMessageDefinition } from "./impl";
import { RawRequestImpl } from "../raw/impl";
import { processRawLines } from "./common";


export class ReplayStreamIterator implements AsyncIterator<Line<ReplayMessage>> {
  private rawItr: AsyncIterator<Line<string>>;
  private defs: { [key: string]: { [key: string ]: ReplayMessageDefinition } } = {};
  private postFilter: { [key: string]: Set<string> } = {};

  constructor(private clientSetting: ClientSetting, private setting: ReplayRequestSetting) {
    const req = new RawRequestImpl(this.clientSetting, {
      filter: convertReplayFilterToRawFilter(this.setting.filter),
      start: this.setting.start,
      end: this.setting.end,
      format: "json",
    });
    this.rawItr = req.stream()[Symbol.asyncIterator]();
    // it needs to post filter
    for (const [exchange, channels] of Object.entries(setting.filter)) {
      this.postFilter[exchange] = new Set();
      for (const channel of channels) {
        this.postFilter[exchange].add(channel);
      }
    }
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
  
      const processed = processRawLines(this.defs, line);

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