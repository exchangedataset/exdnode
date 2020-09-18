/**
 * @internal
 * @packageDocumentation
 */

import readline from 'readline';
import { ClientSetting } from "../../client/impl";
import { SnapshotParam, Snapshot } from "./snapshot";
import { convertAnyDateTime } from "../../utils/datetime";
import { getResponse } from "../../common/download";
import { checkParamFilter } from '../../common/param';

export type SnapshotSetting = {
  exchange: string;
  channels: string[];
  at: bigint;
  format?: string;
}

export function setupSnapshotSetting(param: SnapshotParam): SnapshotSetting {
  if (!('exchange' in param)) throw new Error('"exchange" was not specified');
  if (!('channels' in param)) throw new Error('"channels" was not specified');
  if (!Array.isArray(param.channels)) throw new TypeError('"channels" must be an array of string');
  for (const ch of param.channels) {
    if (typeof ch !== 'string') throw new Error('element of "channels" must be of string type');
  }
  const channels = JSON.parse(JSON.stringify(param.channels));
  if (!('at' in param)) throw new Error('"at" date time was not specified');
  const setting: SnapshotSetting = {
    at: convertAnyDateTime(param.at),
    exchange: param.exchange,
    channels: channels,
  };
  if ('format' in param) {
    if (typeof param.format !== 'string') throw new Error('"format" must be of string type');
    setting.format = param.format;
  }
  return setting;
}

async function readResponse(stream: NodeJS.ReadableStream): Promise<Snapshot[]> {
  return new Promise((resolve, reject) => {
    const lineStream = readline.createInterface({
      input: stream,
    });
    const lineArr: Snapshot[] = [];
    lineStream.on('line', (line: string) => {
      const split = line.split('\t', 3);
      
      // it has no additional information
      lineArr.push({
        timestamp: BigInt(split[0]),
        channel: split[1],
        snapshot: split[2],
      });
    });
    stream.on('error', (error: Error) => reject(new Error(`Catched upper stream error: ${error.message}`)));
    lineStream.on('error', (error: Error) => reject(new Error(`Catched line stream error: ${error.message}`)));
    lineStream.on('close', () => resolve(lineArr));
  });
}

export async function _snapshot(clientSetting: ClientSetting, setting: SnapshotSetting): Promise<Snapshot[]>  {
  const res = await getResponse(
    clientSetting,
    `snapshot/${setting.exchange}/${setting.at}`,
    {
      channels: setting.channels,
      format: setting.format,
    }
  );
  if (res.statusCode === 200) {
    return await readResponse(res.stream);
  } else {
    // 404, no dataset was found
    return []
  }
}
