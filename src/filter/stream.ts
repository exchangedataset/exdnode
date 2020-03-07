import { FilterLine, FilterParam } from './filter';
import { downloadShard } from './common';
import { convertNanosecToMinute } from '../utils/datetime';
import { FILTER_DEFAULT_BUFFER_SIZE } from '../variables';

type Notifier = (err?: any) => void;
type Shard = FilterLine[];
type ShardSlot = { shard?: Shard };

export default class FilterStream implements AsyncIterable<FilterLine> {
  private constructor(
    private shardIterator: AsyncIterator<Shard>,
  ) {}

  [Symbol.asyncIterator](): AsyncIterator<FilterLine> {
    const self = this;
    let itrNext: IteratorResult<Shard> = null;
    let position = 0;

    return {
      async next(): Promise<IteratorResult<FilterLine>> {
        if (itrNext === null) {
          // get very first shard
          // and find the first line
          itrNext = await self.shardIterator.next();
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
            itrNext = await self.shardIterator.next();
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
          itrNext = await self.shardIterator.next();
        }

        // this is not the last line
        return {
          done: false,
          value: line,
        };
      },
    };
  }

  // public [Symbol.asyncIterator](): AsyncIterator<FilterLine> {
  //   const self = this;

  //   let notifier: Notifier | null = null;
  //   let nextDownloadMinute = convertNanosecToMinute(this.filterParam.start);
  //   const endMinute = convertNanosecToMinute(this.filterParam.end);
  //   let position = 0;
  //   let error = null;

  //   const downloadNewShard = () => {
  //     // push null to represent shard downloading
  //     const slot: Shard = { shard: null };
  //     buffer.push(slot);
  //     downloadShard(this.filterParam, nextDownloadMinute).then((shard) => {
  //       slot.shard = shard;
  //       if (notifier !== null) {
  //         // call notifier to let promise in wait for downloading know
  //         notifier();
  //       }
  //     }).catch((err) => {
  //       if (notifier === null) {
  //         error = err;
  //       } else {
  //         // notify error
  //         notifier(err);
  //       }
  //     });
  //     nextDownloadMinute += 1;
  //   }
  //   // start downloading shards to fill buffer
  //   for (let i = 0; i < this.bufferSize && nextDownloadMinute <= endMinute; i += 1) downloadNewShard();

  //   const nextShard = () => {
  //     buffer.shift();
  //     position = 0;
  //     if (nextDownloadMinute <= endMinute) downloadNewShard()
  //     return buffer.length > 0;
  //   }

  //   return {
  //     next(): Promise<IteratorResult<FilterLine>> {
  //       if (error) {
  //         return Promise.reject(error);
  //       }
  //       // first element in buffer should always exist
  //       if (buffer[0].shard === null) {
  //         // shard downloading, needs to wait
  //         return new Promise((resolve, reject) => {

  //         });
  //       } else {
  //         // shard bufferred
  //         const shard = buffer[0].shard;
  //         // at least one line should always exist
  //         const line = shard[position];
  //         postion += 1;
  //         // needs to determine if this line is the very last one
  //         if (shard.length <= position) {
  //           // shard all read, is there next shard expected?
  //           if (nextShard()) {
  //             // expected

  //           } else {
  //             // not expected

  //           }
  //         }


  //         return Promise.resolve(line);
  //       }


  //       return new Promise((resolve, reject) => {
  //         if (error) {
  //           reject(error);
  //           return;
  //         }
  //         if (buffer[0].shard === null) {
  //           // still in download, wait for it using notifier
  //           notifier.push((err) => {
  //             // error occurred on download
  //             if (err) {
  //               notifier = null;
  //               reject(err);
  //               return;
  //             }
  //             const shard = buffer[0].shard;
  //             if (shard === null) {
  //               // first element in buffer is still downloading
  //               return;
  //             } else if (shard.length === 0) {
  //               // shard contains nothing
  //               nextShard();
  //               // wait for the next shard
  //               return;
  //             } else {
  //               if (shard?.length <= position) {
  //                 // shard ran over, it have to return if this line is the last one
  //                 if (buffer.length >= 2) {
  //                   nextShard();
  //                   // do the same thing over next shard
  //                   notifier();
  //                 } else {
  //                   // this is the last shard it can expect
  //                   notifier = null;
  //                   resolve({
  //                     done: true,
  //                     value:
  //                   });
  //                   position += 1;
  //                   return;
  //                 }
  //               } else {
  //                 // have more line to pump

  //               }
  //             }
  //           });
  //         } else {
  //           // line is bufferred
  //           if (buffer[0].shard.length === 0) {
  //             // empty shard, go for the next one
  //             // it must be the very first one shard downloaded
  //             nextShard();
  //             if (buffer.length > 0) {
  //               // it can expect the next one, wait
  //               notifier.push((err) => {
  //                 // error occurred when downloading, reject
  //                 if (err) return Promise.reject(err);
  //                 if (buffer[0].shard?.length === 0) {
  //                   // still empty shard
  //                   buffer.shift();
  //                   if (nextDownloadMinute < convertNanosecToMinute(self.filterParam.end)) {
  //                     // wait
  //                     return false;
  //                   } else {

  //                     return true;
  //                   }
  //                 }
  //               });
  //             } else {
  //               // it can not expect next shard
  //               resolve({
  //                 done: true,
  //                 // no value
  //               });
  //             }
  //           } else if (shard.length < position) {

  //           }
  //         });
  //       }

  //       // check if the shard is in downloading process
  //       if (buffer[0] === null) {
  //         // still downloading, set the notifier and wait for the notifier to be called
  //         return new Promise((resolve, reject) => {
  //           // when the promise callback is called, this condition might be changed
  //           if (buffer[0] === null) {
  //             const notifier: Notifier = (err, lines) => {
  //               // buffer slot filled, download completed or failed
  //               // second check is not required as if err is not undefined lines are
  //               // its there to suppress typescript type check
  //               if (err || typeof lines === 'undefined') reject(err);
  //               if (buffer[1] === null)
  //               else resolve({ done: false, value: lines?[0] });
  //             };
  //             notifier.push(notifier);
  //           } else {
  //             resolve({ done: false, value: });
  //           }
  //         });
  //       } else if (buffer[0].length < position) {
  //         // ran over current shard, remove slot from buffer and move to a next shard
  //         buffer.shift();
  //         buffer.push([null, null]);
  //         nextDownloadMinute += 1;
  //         position = 0;
  //       } else {
  //         const ret = buffer[0].lines[position];
  //         position += 1;
  //         return Promise.resolve(ret);
  //       }
  //     },
  //   };
  // }

  static create(filterParam: FilterParam, bufferSize: number = FILTER_DEFAULT_BUFFER_SIZE) {
    // fill buffer with null value (means not downloaded)
    const buffer: ShardSlot[] = [];
    let notifier: Notifier | null = null;
    let nextDownloadMinute = convertNanosecToMinute(filterParam.start);
    const endMinute = convertNanosecToMinute(filterParam.end);
    let error: any = null;

    const downloadNewShard = () => {
      // push empty slot to represent shard downloading
      const slot: ShardSlot = {};
      buffer.push(slot);
      downloadShard(filterParam, nextDownloadMinute).then((shard) => {
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
              notifier = (err) => {
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
