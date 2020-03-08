"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const datetime_1 = require("../utils/datetime");
const variables_1 = require("../variables");
class FilterStreamIterator {
    constructor(shardIterator) {
        this.shardIterator = shardIterator;
        this.itrNext = null;
        this.position = 0;
    }
    async next() {
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
    static create(clientSetting, filterSetting, bufferSize = variables_1.FILTER_DEFAULT_BUFFER_SIZE) {
        // fill buffer with null value (means not downloaded)
        const buffer = [];
        let notifier = null;
        let nextDownloadMinute = datetime_1.convertNanosecToMinute(filterSetting.start);
        const endMinute = datetime_1.convertNanosecToMinute(filterSetting.end);
        let error = null;
        const downloadNewShard = () => {
            // push empty slot to represent shard downloading
            const slot = {};
            buffer.push(slot);
            common_1.downloadShard(clientSetting, filterSetting, nextDownloadMinute).then((shard) => {
                // once downloaded, set instance of shard
                slot.shard = shard;
                if (notifier !== null) {
                    // call notifier to let promise in wait for downloading know
                    notifier();
                }
            }).catch((err) => {
                if (notifier === null) {
                    error = err;
                }
                else {
                    // notify error
                    notifier(err);
                }
            });
            nextDownloadMinute += 1;
        };
        // start downloading shards to fill buffer
        for (let i = 0; i < bufferSize && nextDownloadMinute <= endMinute; i += 1)
            downloadNewShard();
        const shardIterator = {
            async next() {
                // if error during download was not handled, reject this promise to let others know
                if (error)
                    throw error;
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
                                if (err)
                                    reject(err);
                                if (typeof buffer[0].shard === 'undefined') {
                                    // the first element is still not downloaded
                                    // wait more
                                    return;
                                }
                                const { shard } = buffer[0];
                                buffer.shift();
                                if (nextDownloadMinute <= endMinute)
                                    downloadNewShard();
                                resolve({
                                    done: buffer.length === 0,
                                    value: shard,
                                });
                                // deregister this notifier
                                notifier = null;
                            };
                        }
                        else {
                            const { shard } = buffer[0];
                            buffer.shift();
                            if (nextDownloadMinute <= endMinute)
                                downloadNewShard();
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
                if (nextDownloadMinute <= endMinute)
                    downloadNewShard();
                return Promise.resolve({
                    // if there is no slot in buffer, then there is no next shard
                    done: buffer.length === 0,
                    value: shard,
                });
            },
        };
        return new FilterStreamIterator(shardIterator);
    }
}
exports.default = FilterStreamIterator;
