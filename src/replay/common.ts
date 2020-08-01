/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ReplayMessage } from "./replay";
import { Line, LineType } from "../common/line";
import { Filter } from "../common/param";

type ReplayMessageDefinition = { [key: string]: string };

export default class RawLineProcessor {
  private defs: { [key: string]: { [key: string ]: ReplayMessageDefinition } } = {};
  private postFilter: { [key: string]: Set<string> } = {};

  constructor(filter: Filter) {
    for (const [exchange, channels] of Object.entries(filter)) {
      this.postFilter[exchange] = new Set();
      for (const channel of channels) {
        this.postFilter[exchange].add(channel);
      }
    }
  }

  processRawLines(line: Line<string>): Line<ReplayMessage> | null {
    // convert result if it needs
    if (line.type === LineType.START) {
      // reset definition
      this.defs[line.exchange] = {};
    }
    if (line.type !== LineType.MESSAGE) {
      return line;
    }
  
    const exchange = line.exchange;
    const channel = line.channel!;
    if (!(exchange in this.defs)) {
      // this is the first line for this exchange
      this.defs[exchange] = {};
    }
    if (!(channel in this.defs[exchange])) {
      this.defs[exchange][channel] = JSON.parse(line.message!);
      return null;
    }

    const msgObj = JSON.parse(line.message!)

    // channel name change and post filtering
    let newChannel = channel;
    if (line.exchange === "bitmex") {
      if (channel.indexOf("_") === -1) {
        // no underscore in the channel name
        newChannel = `${channel}_${msgObj["pair"]}`;
      }
      // an underscore in the channel name is an unexpected case
    }
    if (!this.postFilter[exchange].has(newChannel)) {
      return null;
    }

    // type conversion according to the received definition
    const def = this.defs[exchange][channel];
    for (const [name, type] of Object.entries(def)) {
      if ((type === "timestamp" || type === "duration") && msgObj[name] !== null) {
        // convert timestamp type parameter into bigint
        msgObj[name] = BigInt(msgObj[name])
      }
    }

    return {
      type: line.type,
      timestamp: line.timestamp,
      exchange: exchange,
      channel: newChannel,
      message: msgObj,
    };
  }
}
