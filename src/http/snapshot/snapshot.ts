import { AnyDateInstance } from "../../utils/datetime";
import { ClientParam } from "../../client/client";
import { setupSetting as setupClientSetting } from "../../client/impl";
import { setupSetting as setupSnapshotSetting, SnapshotRequestImpl } from "./impl";
import { SnapshotResponse } from "./response";
import { Filter } from "../../common/param";

/**
 * Parameters to make new {@link SnapshotRequest}.
 */
export type SnapshotParam = {
  /**
   * What exchanges and channels to filter-in.
   */
  filter: Filter;
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
 * Request to snapshot HTTP-API endpoint.
 */
export interface SnapshotRequest {
  /**
   * Send request to server.
   */
  download(): Promise<SnapshotResponse>;
}

export function snapshot(clientParam: ClientParam, param: SnapshotParam): SnapshotRequest {
  return new SnapshotRequestImpl(setupClientSetting(clientParam), setupSnapshotSetting(param));
}
