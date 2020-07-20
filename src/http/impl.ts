/**
 * @internal
 * @packageDocumentation
 */

import { HTTPModule } from "./http";
import { ClientSetting } from "../client/impl";
import { FilterParam } from "./filter/filter";
import { SnapshotParam, Snapshot } from "./snapshot/snapshot";
import { setupFilterSetting, _filter } from "./filter/impl";
import { setupSnapshotSetting, _snapshot } from "./snapshot/impl";
import { Shard } from "../common/line";

export class HTTPModuleImpl implements HTTPModule {
  constructor(private clientSetting: ClientSetting) {}

  async filter(param: FilterParam): Promise<Shard<string>> {
    if (typeof param === 'undefined') throw new Error("'param' must be specified")
    const setting = setupFilterSetting(param)
    return await _filter(this.clientSetting, setting)
  }
  
  async snapshot(param: SnapshotParam): Promise<Snapshot[]> {
    if (typeof param === 'undefined') throw new Error("'param' must be specified")
    return await _snapshot(this.clientSetting, setupSnapshotSetting(param));
  }
}
