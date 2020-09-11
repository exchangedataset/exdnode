/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * @internal
 * @packageDocumentation
 */

import { ReplayRequest, ReplayRequestParam, ReplayMessage } from "./replay";
import { Line } from "../common/line";
import { Filter, checkParamFilter } from "../common/param";
import { ClientSetting } from "../client/impl";
import { convertAnyDateTime } from "../utils/datetime";
import { RawRequestImpl } from "../raw/impl";
import RawLineProcessor from "./common";
import { ReplayStreamIterator } from "./stream";

export type ReplayRequestSetting = {
  filter: Filter;
  start: bigint;
  end: bigint;
}
export function setupReplayRequestSetting(param: ReplayRequestParam): ReplayRequestSetting {
  checkParamFilter(param, 'filter');
  const filter = JSON.parse(JSON.stringify(param.filter));
  if (!('start' in param)) throw new Error('"start" date time was not specified');
  const start = convertAnyDateTime(param.start);
  if (!('end' in param)) throw new Error('"end" date time was not specified');
  let end = convertAnyDateTime(param.end);
  if (typeof param.end === 'number') {
    end += BigInt('60') * BigInt('1000000000');
  }
  if (end <= start) {
    throw new Error('Invalid date time range "end" <= "start"');
  }
  return {
    filter,
    start,
    end,
  };
}

export function convertReplayFilterToRawFilter(filter: Filter): Filter {
  // Some exchanges does not support symbol-wise filtering unless formatted
  // Filter channel should be without a symbol name
  const newFilter: Filter = {};
  for (const [exchange, channels] of Object.entries(filter)) {
    if (exchange === "bitmex") {
      const set = new Set<string>();
      for (const channel of channels) {
        // remove symbol/currency name after the underscore if there
        const ui = channel.indexOf("_")
        if (ui !== -1) {
          set.add(channel.substr(0, ui));
        } else {
          set.add(channel);
        }
      }
      newFilter[exchange] = Array.from(set);
    } else {
      newFilter[exchange] = [...channels];
    }
  }
  return newFilter;
}

export function convertReplayFilterToRawPostFilter(postFilter: Filter): Filter {
  // Some messages does not support symbol-wise filtering
  // We need to add a base channel, which does not have a symbol
  const newFilter: Filter = {};
  for (const [exchange, channels] of Object.entries(postFilter)) {
    if (exchange === "bitmex") {
      const set = new Set<string>();
      for (const channel of channels) {
        set.add(channel);
        const ui = channel.indexOf("_")
        if (ui !== -1) {
          set.add(channel.substr(0, ui));
        }
      }
      newFilter[exchange] = Array.from(set);
    } else {
      newFilter[exchange] = [...channels];
    }
  }
  return newFilter;
}

export class ReplayRequestImpl implements ReplayRequest {
  constructor(private clientSetting: ClientSetting, private setting: ReplayRequestSetting) {}

  async download(): Promise<Line<ReplayMessage>[]> {
    const req = new RawRequestImpl(this.clientSetting, {
      filter: convertReplayFilterToRawFilter(this.setting.filter),
      postFilter: convertReplayFilterToRawPostFilter(this.setting.filter),
      start: this.setting.start,
      end: this.setting.end,
      format: "json",
    });

    const array = await req.download();
    const result = Array(array.length)
    const processor = new RawLineProcessor();
    
    let j = 0;
    for (let i = 0; i < array.length; i++) {
      const processed = processor.processRawLines(array[i]);
      if (processed === null) {
        continue;
      }
      result[j] = processed;
      j++;
    }
    return result.slice(0, j);
  }

  stream(bufferSize?: number): AsyncIterable<Line<ReplayMessage>> {
    const { clientSetting, setting } = this;
    return {
      [Symbol.asyncIterator](): AsyncIterator<Line<ReplayMessage>> {
        return new ReplayStreamIterator(clientSetting, setting, bufferSize);
      },
    }
  }
}
