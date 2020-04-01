/**
 * @internal
 * @packageDocumentation
 */

import { ClientSetting } from "../../../client/impl";
import { FILTER_DEFAULT_BUFFER_SIZE } from "../../../constants";
import { convertNanosecToMinute } from "../../../utils/datetime";
import { FilterSetting } from "../impl";
import { Shard } from "../../../common/line";
import { downloadFilterShard } from "../common";

type ShardSlot = { shard?: Shard };
type Notifier = (err?: Error) => void;

export default class FilterStreamShardIterator implements AsyncIterator<Shard> {
  // fill buffer with null value (means not downloaded)
  private buffer: ShardSlot[] = [];
  private notifier: Notifier | null = null;
  private nextDownloadMinute: number;
  private endMinute: number;
  private error: Error | null = null;

  constructor(
    private clientSetting: ClientSetting,
    private setting: FilterSetting,
    bufferSize: number = FILTER_DEFAULT_BUFFER_SIZE,
  ) {
    this.nextDownloadMinute = convertNanosecToMinute(setting.start);
    this.endMinute = convertNanosecToMinute(setting.end);
    // start downloading shards to fill buffer
    for (let i = 0; i < bufferSize && this.nextDownloadMinute <= this.endMinute; i += 1) this.downloadNewShard();
  }

  private downloadNewShard(): void {
    // push empty slot to represent shard downloading
    const slot: ShardSlot = {};
    this.buffer.push(slot);
    downloadFilterShard(
      this.clientSetting,
      this.setting.exchange,
      this.setting.channels,
      this.setting.start,
      this.setting.end,
      this.nextDownloadMinute,
    ).then((shard) => {
      // once downloaded, set instance of shard
      slot.shard = shard;
      if (this.notifier !== null) {
        // call notifier to let promise in wait for downloading know
        this.notifier();
      }
    }).catch((err) => {
      if (this.notifier === null) {
        this.error = err;
      } else {
        // notify error
        this.notifier(err);
      }
    });
    this.nextDownloadMinute += 1;
  };

  public async next(): Promise<IteratorResult<Shard>> {
    // if error during download was not handled, reject this promise to let others know
    if (this.error) throw this.error;

    if (this.buffer.length === 0) {
      return {
        done: true,
        value: null,
      };
    }

    // there is always the first element in buffer
    if (typeof this.buffer[0].shard === 'undefined') {
      // shard is being downloaded, wait for it
      return new Promise((resolve, reject) => {
        // this is in promise callback, it will be called later
        // there might be shard already, check for that
        if (typeof this.buffer[0].shard === 'undefined') {
          this.notifier = (err): void => {
            // download error, reject with it
            if (err) reject(err);
            if (typeof this.buffer[0].shard === 'undefined') {
              // the first element is still not downloaded
              // wait more
              return;
            }
            const { shard } = this.buffer[0];
            this.buffer.shift();
            if (this.nextDownloadMinute <= this.endMinute) this.downloadNewShard();
            resolve({
              done: false,
              value: shard,
            });
            // deregister this notifier
            this.notifier = null;
          };
        } else {
          const { shard } = this.buffer[0];
          this.buffer.shift();
          if (this.nextDownloadMinute <= this.endMinute) this.downloadNewShard();
          resolve({
            done: false,
            value: shard,
          });
        }
      });
    }
    // shard is bufferred, return it
    const { shard } = this.buffer[0];
    this.buffer.shift();
    if (this.nextDownloadMinute <= this.endMinute) this.downloadNewShard();
    return Promise.resolve({
      done: false,
      value: shard,
    });
  }
}
