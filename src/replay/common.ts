/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ReplayMessage } from "./replay";
import { Line, LineType } from "../common/line";
import { ReplayMessageDefinition } from "./impl";

export function processRawLines(defs: { [key: string]: { [key: string ]: ReplayMessageDefinition } }, line: Line<string>): Line<ReplayMessage> | null {
  // convert result if it needs
  if (line.type !== LineType.MESSAGE) {
    return line;
  }

  const exchange = line.exchange;
  const channel = line.channel!;
  if (!(exchange in defs)) {
    // this is the first line for this exchange
    defs[exchange] = {
      [channel]: JSON.parse(line.message!)
    };
    return null;
  }
  if (!(channel in defs[exchange])) {
    defs[exchange][channel] = JSON.parse(line.message!);
    return null;
  }
  const result = JSON.parse(line.message!)
  const header = defs[exchange][channel];
  for (const [name, type] of Object.entries(header)) {
    if (type === "timestamp") {
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
