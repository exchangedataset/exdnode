import readline from "readline";

import { ClientSetting } from "../client/impl";
import { FilterLine, LineType, Exchange } from "./filter";
import { httpsGet, readString } from "../utils/stream";
import { convertLineType } from "./common";
import { FilterSetting, Shard } from "./impl";
import { convertNanosecToMinute } from "../utils/datetime";

export class DownloadedShardsIterator implements AsyncIterator<Shard> {
  private position: number = 0;

  constructor(private shards: Shard[]) {}

  public async next(): Promise<IteratorResult<Shard>> {
    if (this.shards.length === 0) {
      // there is no line left
      return {
        done: true,
        value: null,
      };
    }
    if (this.shards.length === null) {
      // this is the first time this function is called
      this.itrNext = await this.shardIterator.next();
      // there must be at least one shard
    }
    // skip shards which is read until the end, including empty ones as long as available
    while (!this.itrNext.done && this.itrNext.value.length <= this.position) {
      this.itrNext = await this.shardIterator.next();
      // set position back to zero for the new shard
      this.position = 0;
    }
    if (this.itrNext.done) {
      // reached the last line, done
      return {
        done: true,
        value: null,
      };
    }
    // return the line
    const line = this.itrNext.value[this.position];
    this.position += 1;
    return {
      done: false,
      value: line,
    };
  }
}

async function readLines(exchange: Exchange, stream: NodeJS.ReadableStream): Promise<FilterLine[]> {
  return new Promise((resolve, reject) => {
    const lineStream = readline.createInterface({
      input: stream,
    });
    const lineArr: FilterLine[] = [];
    lineStream.on('line', (line: string) => {
      const prefix = line.slice(0, 2);
      let split;
      switch (prefix) {
        case 'ms':
          // message or send have 4 section
          split = line.split('\t', 4);
          lineArr.push({
            exchange,
            type: LineType.MESSAGE,
            timestamp: BigInt(split[1]),
            channel: split[2],
            message: split[3],
          });
          break;
        case 'se':
          split = line.split('\t', 4);
          lineArr.push({
            exchange,
            type: LineType.SEND,
            timestamp: BigInt(split[1]),
            channel: split[2],
            message: split[3],
          });
          break;
        case 'st':
          // start or error have 3 section without channel
          split = line.split('\t', 3);
          lineArr.push({
            exchange,
            type: LineType.START,
            timestamp: BigInt(split[1]),
            message: split[2]
          });
          break;
        case 'er':
          split = line.split('\t', 3);
          lineArr.push({
            exchange,
            type: LineType.ERROR,
            timestamp: BigInt(split[1]),
            message: split[2]
          });
          break;
        default:
          split = line.split('\t', 2);
          // it has no additional information
          lineArr.push({
            exchange,
            type: convertLineType(split[0]),
            timestamp: BigInt(split[1])
          });
          break;
      }
    });
    lineStream.on('error', (error: Error) => reject(error));
    lineStream.on('close', () => resolve(lineArr));
  });
}

/**
 * Download a shard of specified exchange, and minute filtered by channels 
 * @param clientSetting
 * @param exchange
 * @param channels
 * @param start This is needed to cut not needed head/tail from the shard
 * @param end Same as above, but excluded (timestamp < end)
 * @param minute
 */
async function downloadShard(
  clientSetting: ClientSetting,
  exchange: Exchange,
  channels: string[],
  start: bigint,
  end: bigint,
  minute: number,
): Promise<FilterLine[]> {
  // request and download
  const res = await httpsGet(
    clientSetting,
    `filter/${exchange}/${minute}`,
    { channels },
  );

  /* check status code and content-type header */
  const { statusCode, headers } = res;
  // 200 = ok, 404 = database not found
  if (statusCode !== 200 && statusCode !== 404) {
    const msg = await readString(res);
    let error: Error | string;
    try {
      const obj = JSON.parse(msg);
      error = obj.error || obj.message || obj.Message;
    } catch (e) {
      error = msg;
    }
    throw new Error(`Request failed: ${statusCode} ${error}\nPlease check the internet connection and the remaining quota of your API key`);
  }
  // check content type
  const contentType = headers['content-type'];
  if (contentType !== 'text/plain') {
    throw new Error(`Invalid response content-type, expected: 'text/plain' got: '${contentType}'`);
  }

  // process stream to get lines
  let lines: FilterLine[] = [];
  if (statusCode === 200) {
    /* read lines from the response stream */
    lines = await readLines(exchange, res);
  }
  res.destroy();

  // should this head/tail be cut?
  if (convertNanosecToMinute(start) === minute || convertNanosecToMinute(end) === minute) {
    lines = lines.filter((line) => start <= line.timestamp && line.timestamp < end);
  }

  return lines;
}

type ExchangeShards = { [key in Exchange]?: Shard[] };

export async function downloadAllShards(clientSetting: ClientSetting, setting: FilterSetting): Promise<ExchangeShards> {
  const entries = Object.entries(setting.filter) as [Exchange, string[]][];
  // initialize an array to store all shards
  const map: ExchangeShards = Object.fromEntries(entries.map(([exchange]) => [exchange, []]));

  const startMinute = convertNanosecToMinute(setting.start);
  const endMinute = convertNanosecToMinute(setting.end);
  const proms: Promise<Shard[]>[] = [];
  for (const [exchange, channels] of entries) {
    const exchProms: Promise<Shard>[] = [];
    for (let minute = startMinute; minute <= endMinute; minute++) {
      exchProms.push(
        downloadShard(
          clientSetting,
          exchange,
          channels,
          setting.start,
          setting.end,
          minute
        )
      );
    }
    proms.push(Promise.all(exchProms));
  }

  // wait download and processing of all shards
  await Promise.all(proms);

  return map;
}

export ShardIterator 
