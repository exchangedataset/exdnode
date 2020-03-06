import { FilterLine, FilterParam, filter } from "./filter";
import { downloadShard } from "./common";
import { convertNanosecToMinute } from "../utils/datetime";

export default class FilterStream implements AsyncIterable<FilterLine> {
  private constructor(
    private filterParam: FilterParam,
    private bufferSize: number,
  ) {}

  public [Symbol.asyncIterator](): AsyncIterator<FilterLine> {
    // fill buffer with null value (means not downloaded)
    const buffer: FilterLine[] = new Array(this.bufferSize).fill([null, null]);
    const notifiers: ((err: any, lines?: FilterLine[]) => void)[]
    let currentMinute = convertNanosecToMinute(this.filterParam.start);
    let position = 0;

    for (let i = 0; i < this.bufferSize; i += 1) {
      const minute = currentMinute + i;
      // array instance might change when referenced with index id
      // because buffer element could be deleted when that paticular slot
      // is all read and not needed anymore
      // so we preserve "slot" = instance of array not to fail at it
      const slot = buffer[i];
      downloadShard(this.filterParam, minute).then((lines) => {
        slot.lines = lines;
        const { notifiers } = slot;
        notifiers.forEach((notifier) => {
          // call notifier to let promise in wait for downloading know

        });
        if (typeof notifier !== 'undefined') {
          notifier(undefined, lines);
        }
      }).catch((err) => {
        const { notifiers } = slot;
        notifier(err);
      });
    }
    return {
      next(): Promise<IteratorResult<FilterLine>> {
        if ()
        // check if the shard is in downloading process
        if (buffer[0].lines === null) {
          // still downloading, set the notifier and wait for the notifier to be called
          return new Promise((resolve, reject) => {
            buffer[0].notifier = (err, lines) => {
              // buffer slot filled, download completed or failed
              if (err) {
                reject(err);
              }
              if ()
              resolve({
                done: false,
                value: lines[0]
              });
            };
          });
        } else if (buffer[0].lines < position) {
          // ran over current shard, remove slot from buffer and move to a next shard
          buffer.shift();
          buffer.push([null, null]);
          currentMinute += 1;
          position = 0;
        } else {
          const ret = buffer[0].lines[position];
          position += 1;
          return Promise.resolve(ret);
        }
      },
    };
  }
}
