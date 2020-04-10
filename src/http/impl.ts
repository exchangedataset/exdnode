/**
 * @internal
 * @packageDocumentation
 */

import { HTTPModule } from "./http";
import { ClientSetting } from "../client/impl";
import { FilterParam } from "./filter/filter";
import { SnapshotParam, Snapshot } from "./snapshot/snapshot";
import { setupFilterRequestSetting, filterDownload } from "./filter/impl";
import { setupSnapshotRequestSetting, snapshotDownload } from "./snapshot/impl";
import { Shard } from "../common/line";

export class HTTPModuleImpl implements HTTPModule {
  constructor(private clientSetting: ClientSetting) {}

  async filter(param: FilterParam): Promise<Shard> {
    if (typeof param === 'undefined') throw new Error("'param' must be specified")
    const setting = setupFilterRequestSetting(param)
    return await filterDownload(this.clientSetting, setting)
  }
  
  async snapshot(param: SnapshotParam): Promise<Snapshot[]> {
    if (typeof param === 'undefined') throw new Error("'param' must be specified")
    return await snapshotDownload(this.clientSetting, setupSnapshotRequestSetting(param));
  }
}
