import { validateBase64 } from "./utils/base64";

function convertNanosecToMinute(nanosec: bigint): number {
  return Number.parseInt((nanosec / BigInt(60) / BigInt(1000000000)).toString());
}

export interface APIResponse<T> extends Iterable<T> {
  /**
   * Returns internal representation of this response.
   * **DO NOT** modify the returned array.
   */
  raw(): Array<[bigint, string]>;
}

export class Client {
  constructor(private apikey: string) {
    if (typeof apikey !== 'string') throw new TypeError('An API key must be of string type');
    if (!validateBase64(apikey)) throw new TypeError('An API key provided is not in a url-safe base64 format');
    this.apikey = apikey;
  }

  async filter(exchange: string, start: bigint, end: bigint, channels: string[]): FilterResponse {
    /* convert date into utc nanosec (extends unixtime) */
    const startNanosec = convertDatetimeParam(start);
    const endNanosec = convertDatetimeParam(end);
  
    const shard = await getShard(this.apikey, exchange, start);
    // reader.on('line', (line) => {
    //   console.log('line', line);
    // });
    // reader.on('close', () => {

    // });
    return shard;
  };
}
