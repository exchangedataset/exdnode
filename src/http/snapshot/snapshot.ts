import { AnyDateInstance } from "../../utils/datetime";
import { ClientParam } from "../../client/client";
import { SnapshotRequestImpl } from "./request.impl";
import { setupSetting as setupClientSetting } from "../../client/impl";
import { setupSetting as setupSnapshotSetting } from "./impl";
import { SnapshotRequest } from "./request";

/**
 * Specify exchanges as key and their channels as an array of strings to filter.
 */
export type Filter = { [key: string]: string[] };
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

export function snapshot(clientParam: ClientParam, param: SnapshotParam): SnapshotRequest {
  return new SnapshotRequestImpl(setupClientSetting(clientParam), setupSnapshotSetting(param));
}

export * from './request'
