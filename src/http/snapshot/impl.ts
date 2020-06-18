/**
 * @internal
 * @packageDocumentation
 */

import readline from 'readline';
import { ClientSetting } from "../../client/impl";
import { SnapshotParam, Snapshot } from "./snapshot";
import { convertAnyDateTime } from "../../utils/datetime";
import { getResponse } from "../../common/download";

export type SnapshotSetting = {
  exchange: string;
  channels: string[];
  at: bigint;
  format: string;
}

export function setupSnapshotRequestSetting(param: SnapshotParam): SnapshotSetting {
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
    at: convertAnyDateTime(param.at),
    format: param.format,
  }
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

export async function snapshotDownload(clientSetting: ClientSetting, setting: SnapshotSetting): Promise<Snapshot[]>  {
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
