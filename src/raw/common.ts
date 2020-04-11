/**
 * @internal
 * @packageDocumentation
 */

import { Snapshot } from "../http/snapshot/snapshot";
import { Line, LineType } from "../common/line";

export function convertSnapshotToLine(exchange: string, snapshot: Snapshot): Line<string> {
  return {
    exchange,
    timestamp: snapshot.timestamp,
    type: LineType.MESSAGE,
    channel: snapshot.channel,
    message: snapshot.snapshot,
  }
}
