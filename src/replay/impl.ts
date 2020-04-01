/**
 * @internal
 * @packageDocumentation
 */

import { ReplayRequest, ReplayRequestParam } from "./replay";
import { Line } from "../common/line";
import { Filter, checkParamFilter } from "../common/param";
import { ClientSetting } from "../client/impl";
import { convertDatetimeParam } from "../utils/datetime";

export type ReplayRequestSetting = {
  filter: Filter;
  start: bigint;
  end: bigint;
}

export function setupReplayRequestSetting(param: ReplayRequestParam): ReplayRequestSetting {
  if (!('start' in param)) throw new Error('"start" date time was not specified');
  if (!('end' in param)) throw new Error('"end" date time was not specified');
  checkParamFilter(param);

  const start = convertDatetimeParam(param.start);
  let end = convertDatetimeParam(param.end);
  if (typeof param.end === 'number') {
    end += BigInt('60') * BigInt('1000000000');
  }

  if (end <= start) {
    throw new Error('Invalid date time range "end" <= "start"');
  }

  const filter = JSON.parse(JSON.stringify(param.filter));

  return {
    filter,
    start,
    end,
  };
}

export class ReplayRequestImpl implements ReplayRequest {
  constructor(private clientSetting: ClientSetting, private setting: ReplayRequestSetting) {}

  download(): Promise<Line[]> {
    throw new Error("Method not implemented.");
  }
  stream(): AsyncIterable<Line> {
    throw new Error("Method not implemented.");
  }
}
