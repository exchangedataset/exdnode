import { FilterLine } from './filter';
import { ClientSetting } from '../client/impl';
import { FilterSetting } from './impl';
import { Shard, ShardIterator } from './shard_iterator';

export default class FilterStreamIterator implements AsyncIterator<FilterLine> {
  private shardIterator: AsyncIterator<Shard>;
  private itrNext: IteratorResult<Shard> | null;
  private position: number;

  constructor(
    clientSetting: ClientSetting,
    filterSetting: FilterSetting,
    bufferSize?: number,
  ) {
    this.shardIterator = new ShardIterator(clientSetting, filterSetting, bufferSize);
    this.itrNext = null;
    this.position = 0;
  }

  async next(): Promise<IteratorResult<FilterLine>> {
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
