import { AnyDateInstance } from "../../utils/datetime";
import { ClientParam } from "../../client/client";
import { setupClientSetting } from "../../client/impl";
import { setupSnapshotRequestSetting, SnapshotRequestImpl } from "./impl";

/**
 * Parameters to make new {@link SnapshotRequest}.
 */
export type SnapshotParam = {
  /**
   * What exchange to filter-in.
   */
  exchange: string;
  /**
   * What channels to filter-in.
   */
  channels: string[];
  /**
   * Date-time to take snapshot at.
   */
  at: AnyDateInstance;
  /**
   * What format to get response in.
   */
  format: string;
}

/**
 * Snapshot of channel.
 */
export type Snapshot = {
  /**
   * Channel name.
   */
  channel: string;
  /**
   * Timestamp of this snapshot.
   */
  timestamp: bigint;
  /**
   * Snapshot.
   */
  snapshot: string;
}

/**
 * Request to snapshot HTTP-API endpoint.
 */
export interface SnapshotRequest {
  /**
   * Send request to server.
   */
  download(): Promise<Snapshot[]>;
}

export function snapshot(clientParam: ClientParam, param: SnapshotParam): SnapshotRequest {
  return new SnapshotRequestImpl(setupClientSetting(clientParam), setupSnapshotRequestSetting(param));
}
