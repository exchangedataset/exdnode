"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = __importDefault(require("./stream"));
class IncomingFilterResponse {
    constructor(param) {
        this.param = param;
    }
    async downloadAsArray() {
        let downloaded = [];
        let minute = convertNanosecToMinute(this.param.start);
        await downloadShard(this.param.clientSetting.apikey, this.param.exchange, minute, this.param.channels, this.param.clientSetting.timeout);
    }
    /**
     * Read response by streaming.
     *
     * Returns Iterable object yields response line by line.
     * Can be iterated using for-async-of sentence.
     * Iterator yield immidiately if a line is bufferred, waits for download if not avaliable.
     * *Buffering starts after iterator was returned*
     *
     * Higher responsibility is expected as it does not have to wait for the entire data to
     * be downloaded.
     *
     * @returns Object implements `AsyncIterable` which yields response line by line from buffer.
     */
    async stream(bufferSize) {
        return await stream_1.default.create(this.param, bufferSize);
    }
}
exports.default = IncomingFilterResponse;
