/**
 * @internal
 * @packageDocumentation
 */

import { Line } from "../../common/line";
import { RawRequestSetting } from "../impl";
import { ClientSetting } from "../../client/impl";
import ExchangeStreamIterator from "./exchange_iterator";

export default class RawStreamIterator implements AsyncIterator<Line<string>> {
  private states: {
    [key: string]: {
      iterator: AsyncIterator<Line<string>>;
      lastLine: Line<string>;
    };
  } | null = null;
  private exchanges: string[] = [];

  constructor(private clientSetting: ClientSetting, private setting: RawRequestSetting, private bufferSize?: number) {}

  async next(): Promise<IteratorResult<Line<string>>> {
    if (this.states === null) {
      // this is the first time to be called, initialize exchange iterator
      // and read first line and do the normal process
      this.states = {};
      for (const [exchange, channels] of Object.entries(this.setting.filter)) {
        const iterator = new ExchangeStreamIterator(
          this.clientSetting,
          exchange,
          channels,
          this.setting.start,
          this.setting.end,
          this.setting.format,
          this.bufferSize
        );
        const next = await iterator.next();

        // skip if an exchange iterator returns no line
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

    // return the line that has the smallest timestamp across exchanges
    let argmin = 0;
    let min = this.states[this.exchanges[argmin]].lastLine.timestamp;
    for (let i = 1; i < this.exchanges.length; i++) {
      const lastLine = this.states[this.exchanges[i]].lastLine;
      if (lastLine.timestamp < min) {
        argmin = i;
        min = lastLine.timestamp;
      }
    }

    // get the next line for this exchange
    const state = this.states[this.exchanges[argmin]];
    const line = state.lastLine;
    const next = await state.iterator.next()
    if (next.done) {
      // There is no next line, remove exchange from the list
      this.exchanges.splice(argmin, 1);
    }
    state.lastLine = next.value;

    return {
      done: false,
      value: line,
    }
  }
}
