/**
 * @internal
 * @packageDocumentation
 */

import { ClientSetting } from "../../client/impl";
import { SnapshotParam, SnapshotRequest } from "./snapshot";
import { convertDatetimeParam } from "../../utils/datetime";
import { SnapshotResponse } from "./response";
import { checkParamFilter, Filter } from "../../common/param";

export type SnapshotSetting = {
  filter: Filter;
  at: bigint;
  format: string;
}

export function setupSetting(param: SnapshotParam): SnapshotSetting {
  if (!('at' in param)) throw new Error('"at" date time was not specified.');

  checkParamFilter(param);
  if (!('format' in param)) throw new Error('"format" was not specified.');
  if (typeof param.format !== 'string') throw new Error('"format" must be of string type');
  
  const filter = JSON.parse(JSON.stringify(param.filter))

  return {
    filter,
    at: convertDatetimeParam(param.at),
    format: param.format,
  }
}

export class SnapshotRequestImpl implements SnapshotRequest {
  constructor(private clientSetting: ClientSetting, private setting: SnapshotSetting) {}

  async download(): Promise<SnapshotResponse> {
    throw new Error("Method not implemented.");
  }
}
