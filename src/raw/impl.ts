/**
 * @internal
 * @packageDocumentation
 */

import { RawRequest, RawRequestParam } from "./raw";
import { Line } from "../common/line";
import { Filter, checkParamFilter } from "../common/param";
import { ClientSetting } from "../client/impl";
import { convertAnyDateTime } from "../utils/datetime";
import download from "./download";
import RawStreamIterator from './stream/iterator';

export type RawRequestSetting = {
  filter: Filter;
  start: bigint;
  end: bigint;
  format?: string;
}

export function setupRawRequestSetting(param: RawRequestParam): RawRequestSetting {
  checkParamFilter(param, 'filter');
  const filter = JSON.parse(JSON.stringify(param.filter));
  if (!('start' in param)) throw new Error('"start" date time was not specified');
  if (!('end' in param)) throw new Error('"end" date time was not specified');
  const start = convertAnyDateTime(param.start);
  let end = convertAnyDateTime(param.end);
  if (typeof param.end === 'number') {
    end += BigInt('60') * BigInt('1000000000');
  }
  if (end <= start) {
    throw new Error('Invalid date time range "end" <= "start"');
  }
  // set essential fields
  const setting: RawRequestSetting = {
    filter,
    start,
    end,
  }
  // set optional fields
  if ('format' in param) {
    if (typeof param.format !== 'string') throw new Error('"format" must be of string type');
    setting.format = param.format;
  }
  return setting;
}

export class RawRequestImpl implements RawRequest {
  constructor(private clientSetting: ClientSetting, private setting: RawRequestSetting) {}

  async download(): Promise<Line<string>[]> {
    return download(this.clientSetting, this.setting);
  }
  stream(bufferSize?: number): AsyncIterable<Line<string>> {
    const clientSetting = this.clientSetting;
    const setting = this.setting;
    return {
      [Symbol.asyncIterator](): AsyncIterator<Line<string>> {
        return new RawStreamIterator(clientSetting, setting, bufferSize);
      },
    }
  }
}
