import { AnyDateTime } from "../../utils/datetime";
import { ClientParam } from "../../client/client";
import { setupClientSetting } from "../../client/impl";
import { setupSnapshotSetting, _snapshot } from "./impl";

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
   * What channels to filter-in after the formatting.
   */
  postFilter?: string[];
  /**
   * Date-time to take snapshot at.
   */
  at: AnyDateTime;
  /**
   * What format to get response in.
   */
  format?: string;
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
 * Returns `Promise` of {@link Snapshot}s for given client and snapshot parameter.
 * @param clientParam Client parameter
 * @param param Snapshot parameter
 */
export async function snapshot(clientParam: ClientParam, param: SnapshotParam): Promise<Snapshot[]> {
  if (typeof clientParam === 'undefined') throw new Error("'clientParam' must be specified")
  if (typeof param === 'undefined') throw new Error("'param' must be specified")
  return await _snapshot(setupClientSetting(clientParam), setupSnapshotSetting(param));
}
