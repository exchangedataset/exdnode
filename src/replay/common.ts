/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ReplayMessage } from "./replay";
import { Line, LineType } from "../common/line";

type ReplayMessageDefinition = { [key: string]: string };

export default class RawLineProcessor {
  private defs: { [key: string]: { [key: string ]: ReplayMessageDefinition } } = {};

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
      this.defs[exchange] = {
        [channel]: JSON.parse(line.message!)
      };
      return null;
    }
    if (!(channel in this.defs[exchange])) {
      this.defs[exchange][channel] = JSON.parse(line.message!);
      return null;
    }
    const result = JSON.parse(line.message!)
    const header = this.defs[exchange][channel];
    for (const [name, type] of Object.entries(header)) {
      if ((type === "timestamp" || type === "duration") && result[name] !== null) {
        // convert timestamp type parameter into bigint
        result[name] = BigInt(result[name])
      }
    }
  
    let newChannel = line.channel;
    if (line.exchange === "bitmex") {
      if (line.channel === "orderBookL2") {
        newChannel = `orderBookL2_${result.pair}`
      } else if (line.channel === "trade") {
        newChannel = `trade_${result.pair}`
      }
    }
  
    return {
      type: line.type,
      timestamp: line.timestamp,
      exchange: line.exchange,
      channel: newChannel,
      message: result,
    };
  }
}
