import { FilterLine } from './filter';
import { downloadShard } from './common';
import { convertNanosecToMinute } from '../utils/datetime';
import { FILTER_DEFAULT_BUFFER_SIZE } from '../variables';
import { ClientSetting } from '../client/impl';
import { FilterSetting } from './impl';

type Notifier = (err?: Error) => void;
type Shard = FilterLine[];
type ShardSlot = { shard?: Shard };

export default class FilterStream implements AsyncIterable<FilterLine> {
  private constructor(
    private shardIterator: AsyncIterator<Shard>,
  ) {}

  [Symbol.asyncIterator](): AsyncIterator<FilterLine> {
    const shardIterator = this.shardIterator;
    let itrNext: IteratorResult<Shard> | null = null;
    let position = 0;

    return {
      async next(): Promise<IteratorResult<FilterLine>> {
        if (itrNext === null) {
          // get very first shard
          // and find the first line
          itrNext = await shardIterator.next();
          // there could be empty shard (length === 0) which have to be ignored
          while (itrNext.value.length === 0) {
            if (itrNext.done) {
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
            itrNext = await shardIterator.next();
          }
          // itrNext.value is the shard that has at least one line
          // position === 0
        }
        // at this point, the line to return for this call is already
        // determined except if caller had missed done=true flag
        // and called this method again, which is a invalid move
        if (itrNext.value.length <= position) {
          // line to return should exist, but none found
          // caller must have missed done=true
          throw new Error('Iterator out of range: did you check "done"?');
        }
        const line = itrNext.value[position];
        position += 1;
        // find out if this line is the last line
        while (itrNext.value.length <= position) {
          // this shard has been all read, go to next shard if there is
          if (itrNext.done) {
            // there is no next shard, this is the last line
            return {
              done: true,
              value: line,
            };
          }
          // set position back to 0 for the next shard
          position = 0;
          // eslint-disable-next-line no-await-in-loop
          itrNext = await shardIterator.next();
        }

        // this is not the last line
        return {
          done: false,
          value: line,
        };
      },
    };
  }

  static create(
    clientSetting: ClientSetting,
    filterParam: FilterSetting,
    bufferSize: number = FILTER_DEFAULT_BUFFER_SIZE,
  ): FilterStream {
    // fill buffer with null value (means not downloaded)
    const buffer: ShardSlot[] = [];
    let notifier: Notifier | null = null;
    let nextDownloadMinute = convertNanosecToMinute(filterParam.start);
    const endMinute = convertNanosecToMinute(filterParam.end);
    let error: Error | null = null;

    const downloadNewShard = (): void => {
      // push empty slot to represent shard downloading
      const slot: ShardSlot = {};
      buffer.push(slot);
      downloadShard(clientSetting, filterParam, nextDownloadMinute).then((shard) => {
        // once downloaded, set instance of shard
        slot.shard = shard;
        if (notifier !== null) {
          // call notifier to let promise in wait for downloading know
          notifier();
        }
      }).catch((err) => {
        if (notifier === null) {
          error = err;
        } else {
          // notify error
          notifier(err);
        }
      });
      nextDownloadMinute += 1;
    };

    // start downloading shards to fill buffer
    for (let i = 0; i < bufferSize && nextDownloadMinute <= endMinute; i += 1) downloadNewShard();

    const shardIterator: AsyncIterator<Shard> = {
      async next(): Promise<IteratorResult<Shard>> {
        // if error during download was not handled, reject this promise to let others know
        if (error) throw error;

        if (buffer.length === 0) {
          throw new Error('Iterator overran buffer');
        }

        // there is always the first element in buffer
        if (typeof buffer[0].shard === 'undefined') {
          // shard is being downloaded, wait for it
          return new Promise((resolve, reject) => {
            // this is in promise callback, it will be called later
            // there might be shard already, check for that
            if (typeof buffer[0].shard === 'undefined') {
              notifier = (err): void => {
                // download error, reject with it
                if (err) reject(err);
                if (typeof buffer[0].shard === 'undefined') {
                  // the first element is still not downloaded
                  // wait more
                  return;
                }
                const { shard } = buffer[0];
                buffer.shift();
                if (nextDownloadMinute <= endMinute) downloadNewShard();
                resolve({
                  done: buffer.length === 0,
                  value: shard,
                });
                // deregister this notifier
                notifier = null;
              };
            } else {
              const { shard } = buffer[0];
              buffer.shift();
              if (nextDownloadMinute <= endMinute) downloadNewShard();
              resolve({
                done: buffer.length === 0,
                value: shard,
              });
            }
          });
        }
        // shard is bufferred, return it
        const { shard } = buffer[0];
        buffer.shift();
        if (nextDownloadMinute <= endMinute) downloadNewShard();
        return Promise.resolve({
          // if there is no slot in buffer, then there is no next shard
          done: buffer.length === 0,
          value: shard,
        });
      },
    };

    return new FilterStream(shardIterator);
  }
}
