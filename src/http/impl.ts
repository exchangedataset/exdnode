import { HTTPModule } from "./http";
import { ClientSetting } from "../client/impl";
import { FilterParam, FilterRequest } from "./filter/filter";
import { SnapshotParam, SnapshotRequest } from "./snapshot/snapshot";
import { FilterRequestImpl, setupSetting as setupFilterRequestSetting } from "./filter/impl";
import { SnapshotRequestImpl, setupSetting as setupSnapshotRequestSetting } from "./snapshot/impl";

export class HTTPModuleImpl implements HTTPModule {
  constructor(private setting: ClientSetting) {}

  filter(param: FilterParam): FilterRequest {
    return new FilterRequestImpl(this.setting, setupFilterRequestSetting(param));
  }
  snapshot(param: SnapshotParam): SnapshotRequest {
    return new SnapshotRequestImpl(this.setting, setupSnapshotRequestSetting(param));
  }
}
