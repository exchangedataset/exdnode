/**
 * @internal
 * @packageDocumentation
 */

import { ClientSetting } from '../../client/impl';
import ExchangeStreamShardIterator from './shard_iterator';
import { Line, Shard } from '../../common/line';

export default class ExchangeStreamIterator implements AsyncIterator<Line<string>> {
  private shardIterator: AsyncIterator<Shard<string>>;
  private itrNext: IteratorResult<Shard<string>> | null;
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

  async next(): Promise<IteratorResult<Line<string>>> {
    if (this.itrNext === null) {
      // get very first shard
      this.itrNext = await this.shardIterator.next();
    }
    // skip shards does not have any more lines (or empty) as long as available
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
