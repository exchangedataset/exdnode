import { FilterLine } from './filter';
import { ClientSetting } from '../client/impl';
import { FilterSetting } from './impl';
import { Shard, ShardIterator } from './shard_iterator';

export default class FilterStreamIterator implements AsyncIterator<FilterLine> {
  private shardIterator: AsyncIterator<Shard>;
  private itrNext: IteratorResult<Shard> | null;
  private position: number;

  private constructor(
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
      // and find the first line
      this.itrNext = await this.shardIterator.next();
      // there could be empty shard (length === 0) which have to be ignored
      while (this.itrNext.value.length === 0) {
        if (this.itrNext.done) {
          // nothing from the beginning, no lines at all
          return {
            done: true,
            value: null,
          };
        }
        // move to next shard
        // this must be await-ed because it needs this return value for this loop to find
        // if the next next shard exists
        // eslint-disable-next-line no-await-in-loop
        this.itrNext = await this.shardIterator.next();
      }
      // itrNext.value is the shard that has at least one line
      // position === 0
    }
    // at this point, the line to return for this call is already
    // determined except if caller had missed done=true flag
    // and called this method again, which is a invalid move
    if (this.itrNext.value.length <= this.position) {
      // line to return should exist, but none found
      // caller must have missed done=true
      throw new Error('Iterator out of range: did you check "done"?');
    }
    const line = this.itrNext.value[this.position];
    this.position += 1;
    // find out if this line is the last line
    while (this.itrNext.value.length <= this.position) {
      // this shard has been all read, go to next shard if there is
      if (this.itrNext.done) {
        // there is no next shard, this is the last line
        return {
          done: true,
          value: line,
        };
      }
      // set position back to 0 for the next shard
      this.position = 0;
      // eslint-disable-next-line no-await-in-loop
      this.itrNext = await this.shardIterator.next();
    }

    // this is not the last line
    return {
      done: false,
      value: line,
    };
  }
}
