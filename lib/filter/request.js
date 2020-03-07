"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datetime_1 = require("../utils/datetime");
const common_1 = require("./common");
const stream_1 = __importDefault(require("./stream"));
class FilterRequestImpl {
    constructor(param) {
        this.param = param;
    }
    async downloadAsArray() {
        const startMinute = datetime_1.convertNanosecToMinute(this.param.start);
        const endMinute = datetime_1.convertNanosecToMinute(this.param.end);
        const promises = [];
        for (let minute = startMinute; minute < endMinute; minute += 1) {
            promises.push(common_1.downloadShard(this.param, minute));
        }
        return Promise.all(promises)
            .then((shards) => [].concat(...shards));
    }
    async stream(bufferSize) {
        return stream_1.default.create(this.param, bufferSize);
    }
}
exports.default = FilterRequestImpl;
