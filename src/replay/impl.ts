/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * @internal
 * @packageDocumentation
 */

import { ReplayRequest, ReplayRequestParam, ReplayMessage } from "./replay";
import { Line } from "../common/line";
import { Filter, checkParamFilter } from "../common/param";
import { ClientSetting } from "../client/impl";
import { convertDatetimeParam } from "../utils/datetime";
import { RawRequestImpl, setupRawRequestSetting } from "../raw/impl";
import { processRawLines } from "./common";
import { ReplayStreamIterator } from "./stream";

export type ReplayMessageDefinition = { [key: string]: string };

export type ReplayRequestSetting = {
  filter: Filter;
  start: bigint;
  end: bigint;
}

export function convertReplayFilterToRawFilter(param: Filter): Filter {
  const filter: Filter = {};
  for (const [exchange, channels] of Object.entries(param)) {
    if (exchange === "bitmex") {
      const set = new Set<string>();
      for (const channel of channels) {
        if (channel.startsWith("orderBookL2")) {
          set.add("orderBookL2");
        } else if (channel.startsWith("trade")) {
          set.add("trade");
        } else {
          set.add(channel);
        }
      }
      filter[exchange] = Array.from(set);
    } else {
      filter[exchange] = channels
    }
  }
  return filter;
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

  async download(): Promise<Line<ReplayMessage>[]> {
    const req = new RawRequestImpl(this.clientSetting, setupRawRequestSetting({
      filter: convertReplayFilterToRawFilter(this.setting.filter),
      start: this.setting.start,
      end: this.setting.end,
      format: "json",
    }));

    const postFilter: { [key: string]: Set<string> } = {};
    for (const [exchange, channels] of Object.entries(this.setting.filter)) {
      postFilter[exchange] = new Set();
      for (const channel of channels) {
        postFilter[exchange].add(channel);
      }
    }

    const array = await req.download();
    const result = Array(array.length)
    const defs: { [key: string]: { [key: string]: ReplayMessageDefinition } } = {};
    
    let j = 0;
    for (let i = 0; i < array.length; i++) {
      const processed = processRawLines(defs, array[i]);
      if (processed === null) {
        continue;
      }
      if (!postFilter[processed.exchange!].has(processed.channel!)) {
        continue;
      }
      result[j] = processed;
      j++;
    }
    return result.slice(0, j);
  }

  stream(): AsyncIterable<Line<ReplayMessage>> {
    const { clientSetting, setting } = this;
    return {
      [Symbol.asyncIterator](): AsyncIterator<Line<ReplayMessage>> {
        return new ReplayStreamIterator(clientSetting, setting);
      },
    }
  }
}