/**
 * @internal
 * @packageDocumentation
 */

import { SnapshotRequest } from "./request";
import { SnapshotResponse } from "./response";
import { ClientSetting } from "../../client/impl";
import { SnapshotSetting } from "./impl";

export class SnapshotRequestImpl implements SnapshotRequest {
  constructor(private clientSetting: ClientSetting, private setting: SnapshotSetting) {}

  async download(): Promise<SnapshotResponse> {
    throw new Error("Method not implemented.");
  }
}
