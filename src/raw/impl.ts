import { RawRequest, RawRequestParam } from "./raw";
import { Line } from "../common/line";
import { Filter, checkParamFilter } from "../common/param";
import { ClientSetting } from "../client/impl";
import { convertDatetimeParam } from "../utils/datetime";
import { setupSetting as setupSnapshotRequestSetting } from "../http/snapshot/impl";
import { SnapshotRequestImpl } from "../http/snapshot/impl";
import { SnapshotParam } from "../http/snapshot/snapshot";

export type RawRequestSetting = {
  filter: Filter;
  start: bigint;
  end: bigint;
  format: "raw" | "csvlike";
}

export function setupSetting(param: RawRequestParam): RawRequestSetting {
  if (!('start' in param)) throw new Error('"start" date time was not specified.');
  if (!('end' in param)) throw new Error('"end" date time was not specified.');
  checkParamFilter(param);
  if (!('format' in param)) throw new Error('"format" was not specified.');
  if (typeof param.format !== 'string') throw new Error('"format" must be of string type');

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
    format: param.format,
  };
}

export class RawRequestImpl implements RawRequest {
  constructor(private clientSetting: ClientSetting, private setting: RawRequestSetting) {}

  private makeSnapshotParam(): SnapshotParam {
    return {
      filter: this.setting.filter,
      at: this.setting.start,
      format: this.setting.format,
    }
  }

  async download(): Promise<Line[]> {
    const sreq = new SnapshotRequestImpl(this.clientSetting, setupSnapshotRequestSetting(this.makeSnapshotParam()))
    const ss = await sreq.download();
    

  }
  stream(): AsyncIterable<Line> {
    throw new Error("Method not implemented.");
  }
}
