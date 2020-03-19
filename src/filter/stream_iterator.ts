import { FilterLine } from "./filter";
import { ClientSetting } from "../client/impl";
import { FilterSetting } from "./impl";
import StreamExchangeIterator from "./stream_exchange_iterator";

export default class StreamIterator implements AsyncIterator<FilterLine> {
  private states: {
    [key: string]: {
      iterator: StreamExchangeIterator;
      lastLine: FilterLine;
    };
  } | null = null;
  private exchanges: string[] = [];

  constructor(private clientSetting: ClientSetting, private setting: FilterSetting, private bufferSize?: number) {}

  async next(): Promise<IteratorResult<FilterLine>> {
    if (this.states === null) {
      // this is the first time to be called, initialize exchange iterator
      // and read fist line and do the normal process
      this.states = {};
      for (const [exchange, channels] of Object.entries(this.setting.filter)) {
        const iterator = new StreamExchangeIterator(this.clientSetting, exchange, channels, this.setting.start, this.setting.end, this.bufferSize);
        const next = await iterator.next();

        // skip if exchange iterator returns no lines at all (empty)
        if (next.done) {
          continue;
        }
        this.states[exchange] = {
          iterator,
          lastLine: next.value,
        }
        this.exchanges.push(exchange);
      }
    }
    if (this.exchanges.length === 0) {
      // all lines returned
      return {
        done: true,
        value: null,
      }
    }

    // return the line that has the smallest timestamp of all shards of each exchange
    let argmin = this.exchanges.length - 1;
    let min = this.states[this.exchanges[argmin]].lastLine.timestamp;
    for (let i = this.exchanges.length - 1; i >= 0; i--) {
      const lastLine = this.states[this.exchanges[i]].lastLine;
      if (lastLine.timestamp < min) {
        argmin = i;
        min = lastLine.timestamp;
      }
    }

    // prepare the next line for this shard
    const state = this.states[this.exchanges[argmin]];
    const line = state.lastLine;
    const next = await state.iterator.next()
    if (next.done) {
      // it does not have next line, remove this exchange from list
      this.exchanges.splice(argmin, 1);
    }
    state.lastLine = next.value;

    return {
      done: false,
      value: line,
    }
  }
}
