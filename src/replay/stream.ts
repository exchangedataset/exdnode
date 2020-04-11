import { ReplayMessage } from "./replay";
import { Line } from "../common/line";
import { ClientSetting } from "../client/impl";
import { ReplayRequestSetting, convertReplayFilterToRawFilter, ReplayMessageDefinition } from "./impl";
import { RawRequestImpl } from "../raw/impl";
import { processRawLines } from "./common";


export class ReplayStreamIterator implements AsyncIterator<Line<ReplayMessage>> {
  private rawItr: AsyncIterator<Line<string>>;
  private defs: { [key: string]: { [key: string ]: ReplayMessageDefinition } } = {};

  constructor(private clientSetting: ClientSetting, private setting: ReplayRequestSetting) {
    const req = new RawRequestImpl(this.clientSetting, {
      filter: convertReplayFilterToRawFilter(this.setting.filter),
      start: this.setting.start,
      end: this.setting.end,
      format: "json",
    });
    this.rawItr = req.stream()[Symbol.asyncIterator]();
  }
  
  async next(): Promise<IteratorResult<Line<ReplayMessage>>> {
    const nx = await this.rawItr.next();
    if (nx.done) {
      return {
        done: true,
        value: null,
      };
    }
    const line = nx.value;
    const exchange = line.exchange;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const channel = line.channel!;
    if (!(exchange in this.defs)) {
      // this is the first line for this exchange
      this.defs[exchange] = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [channel]: JSON.parse(line.message!)
      }
    }
    if (!(channel in this.defs[exchange])) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.defs[exchange][channel] = JSON.parse(line.message!)
    }

    const processed = processRawLines(this.defs[exchange][channel], line);

    return {
      done: false,
      value: processed,
    }
  }
}