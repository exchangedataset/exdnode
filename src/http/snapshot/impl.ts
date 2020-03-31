/**
 * @internal
 * @packageDocumentation
 */

import { HTTPModule } from "../http";
import { FilterRequestBuilder } from "../filter/filter";
import { ClientSetting } from "../../client/impl";
import { SnapshotRequestBuilder } from "./builder/builder";
import { FilterRequestBuilderImpl } from "../filter/builder/impl";
import { SnapshotParam, Filter } from "./snapshot";
import { convertDatetimeParam } from "../../utils/datetime";

export type SnapshotSetting = {
  filter: Filter;
  at: bigint;
  format: string;
}

export function setupSetting(param: SnapshotParam): SnapshotSetting {
  if (!('at' in param)) throw new Error('"at" date time was not specified.');

  if (!('filter' in param)) throw new Error('"filter" is undefined, there must be at least one channel to filter.');
  if (Object.keys(param.filter).length === 0) throw new Error('"filter" must contain at least one channel to filter, found no exchange.');
  for (const [exchange, channels] of Object.entries(param.filter)) {
    if (typeof exchange !== 'string') throw new Error(`"filter" must have exchange as key which is string, found ${typeof exchange}.`);
    if (!Array.isArray(channels)) throw new Error(`"filter.${exchange}" must be an array of channels.`);
    if (!channels.every((ch) => typeof ch === 'string')) throw new Error(`Channels for ${exchange} must be of string type, at least one of them wasn't.`);
  }
  if (!('format' in param)) throw new Error('"format" was not specified.');
  if (typeof param.format !== 'string') throw new Error('"format" must be of string type');
  
  const filter = JSON.parse(JSON.stringify(param.filter))

  return {
    filter,
    at: convertDatetimeParam(param.at),
    format: param.format,
  }
}

export class HTTPModuleImpl implements HTTPModule {
  constructor(private setting: ClientSetting) {}
  snapshot(): SnapshotRequestBuilder {
    throw new Error("Method not implemented.");
  }

  filter(): FilterRequestBuilder {
    return new FilterRequestBuilderImpl(this.setting);
  }
}
