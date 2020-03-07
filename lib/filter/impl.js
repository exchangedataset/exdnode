"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datetime_1 = require("../utils/datetime");
const common_1 = require("./common");
const stream_1 = __importDefault(require("./stream"));
function setupSetting(params) {
    const start = datetime_1.convertDatetimeParam(params.start);
    const end = datetime_1.convertDatetimeParam(params.end);
    // must return new object so it won't be modified externally
    return {
        exchange: params.exchange,
        start,
        end,
        channels: params.channels.slice(0),
    };
}
exports.setupSetting = setupSetting;
class FilterRequestImpl {
    constructor(clientSetting, setting) {
        this.clientSetting = clientSetting;
        this.setting = setting;
    }
    async download() {
        const startMinute = datetime_1.convertNanosecToMinute(this.setting.start);
        const endMinute = datetime_1.convertNanosecToMinute(this.setting.end);
        const promises = [];
        for (let minute = startMinute; minute < endMinute; minute += 1) {
            promises.push(common_1.downloadShard(this.clientSetting, this.setting, minute));
        }
        return Promise.all(promises)
            .then((shards) => [].concat(...shards));
    }
    stream(bufferSize) {
        return stream_1.default.create(this.clientSetting, this.setting, bufferSize);
    }
}
exports.FilterRequestImpl = FilterRequestImpl;
