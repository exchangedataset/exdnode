import { ReplayMessage } from "./replay";
import { Line, LineType } from "../common/line";
import { ReplayMessageDefinition } from "./impl";

export function processRawLines(header: ReplayMessageDefinition, line: Line<string>): Line<ReplayMessage> {
  if (line.type === LineType.MESSAGE) {
    // convert result if it needs
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = JSON.parse(line.message!)
    for (const [name, type] of Object.entries(header)) {
      if (type === "timestamp") {
        // convert timestamp type parameter into bigint
        result[name] = BigInt(result[name])
      }
    }

    let channel = line.channel;
    if (line.exchange === "bitmex") {
      if (line.channel === "orderBookL2") {
        channel = `orderBookL2_${result.pair}`
      } else if (line.channel === "trade") {
        channel = `trade_${result.pair}`
      }
    }

    return {
      type: line.type,
      timestamp: line.timestamp,
      exchange: line.exchange,
      channel: channel,
      message: result,
    };
  }
  
  return line as unknown as Line<ReplayMessage>;
}
