/**
 * @internal
 * @packageDocumentation
 */

import { ClientSetting } from '../../client/impl';
import ExchangeStreamShardIterator from './shard_iterator';
import { Line, Shard } from '../../common/line';

export default class ExchangeStreamIterator implements AsyncIterator<Line> {
  private shardIterator: AsyncIterator<Shard>;
  private itrNext: IteratorResult<Shard> | null;
  private position: number;

  constructor(
    clientSetting: ClientSetting,
    exchange: string,
    channels: string[],
    start: bigint,
    end: bigint,
    format: string,
    bufferSize?: number,
  ) {
    this.shardIterator = new ExchangeStreamShardIterator(clientSetting, exchange, channels, start, end, format, bufferSize);
    this.itrNext = null;
    this.position = 0;
  }

  async next(): Promise<IteratorResult<Line>> {
    if (this.itrNext === null) {
      // get very first shard
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
