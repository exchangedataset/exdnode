"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const variables_1 = require("../variables");
class FilterStream {
    constructor(filterParam, bufferSize) {
        this.filterParam = filterParam;
        this.bufferSize = bufferSize;
        this.position = 0;
    }
    [Symbol.asyncIterator]() {
        // fill buffer with null value (means not downloaded)
        const buffer = new Array(bufferSize).fill([null, null]);
        let currentMinute = convertNanosecToMinute(start);
        for (let i = 0; i < this.bufferSize; i += 1) {
            const minute = this.currentMinute + i;
            common_1.downloadShard(this.).then((lines) => {
                this.buffer[i].lines = lines;
                const notifier = this.buffer[i].notifier;
                if (typeof notifier !== 'undefined') {
                    // call notifier to let promise in wait for downloading know
                    this.buffer[i].notifier();
                }
            });
        }
        const self = this;
        return {
            next() {
                // check if the shard it will read is still in downloading process
                if (self.buffer[0].lines === null) {
                    // still downloading, set the notifier and wait for the notifier to be called
                    return new Promise((resolve, reject) => {
                        self.buffer[0].notifier = (err, lines) => {
                            if (err) {
                                reject(err);
                            }
                            resolve();
                        };
                    });
                }
            },
        };
    }
    static async create(params, bufferSize = variables_1.FILTER_DEFAULT_BUFFER_SIZE) {
        const stream = new FilterStream(params, bufferSize);
    }
}
exports.default = FilterStream;
