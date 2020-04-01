/**
 * @internal
 * @packageDocumentation
 */

import readline from 'readline';
import { ClientSetting } from "../../client/impl";
import { SnapshotParam, SnapshotRequest, Snapshot } from "./snapshot";
import { convertDatetimeParam } from "../../utils/datetime";
import { getResponse } from "../../common/download";

export type SnapshotRequestSetting = {
  exchange: string;
  channels: string[];
  at: bigint;
  format: string;
}

export function setupSnapshotRequestSetting(param: SnapshotParam): SnapshotRequestSetting {
  if (!('at' in param)) throw new Error('"at" date time was not specified');

  if (!('exchange' in param)) throw new Error('"exchange" was not specified');
  if (!('channels' in param)) throw new Error('"topics" was not specified');
  for (const ch of param.channels) {
    if (typeof ch !== 'string') throw new Error('element of "channels" must be of string type');
  }
  if (!('format' in param)) throw new Error('"format" was not specified');
  if (typeof param.format !== 'string') throw new Error('"format" must be of string type');
  
  const topics = JSON.parse(JSON.stringify(param.channels));

  return {
    exchange: param.exchange,
    channels: topics,
    at: convertDatetimeParam(param.at),
    format: param.format,
  }
}

async function readResponse(exchange: string, res: NodeJS.ReadableStream): Promise<Snapshot[]> {
  return new Promise((resolve, reject) => {
    const lineStream = readline.createInterface({
      input: res,
    });
    const lineArr: Snapshot[] = [];
    lineStream.on('line', (line: string) => {
      const split = line.split('\t', 3);
      
      // it has no additional information
      lineArr.push({
        channel: split[0],
        timestamp: BigInt(split[1]),
        snapshot: split[2],
      });
    });
    lineStream.on('error', (error: Error) => reject(error));
    lineStream.on('close', () => resolve(lineArr));
  });
}

export class SnapshotRequestImpl implements SnapshotRequest {
  constructor(private clientSetting: ClientSetting, private setting: SnapshotRequestSetting) {}

  async download(): Promise<Snapshot[]> {
    const res = await getResponse(
      this.clientSetting,
      `snapshot/${this.setting.exchange}/${this.setting.at}`,
      { topics: this.setting.channels }
    );
    return await readResponse(this.setting.exchange, res);
  }
}
