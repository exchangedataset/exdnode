"use strict";
/**
 * @internal
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datetime_1 = require("../../utils/datetime");
const iterator_1 = __importDefault(require("./stream/iterator"));
const common_1 = require("./common");
function setupFilterRequestSetting(param) {
    if (!('start' in param))
        throw new Error('"start" date time was not specified');
    if (!('end' in param))
        throw new Error('"end" date time was not specified');
    // type check for those parameter will be done in convertDatetimeParam function
    if (!('exchange' in param))
        throw new Error('"exchange" was not specified');
    if (!('channels' in param))
        throw new Error('"channels" was not specified');
    for (const ch of param.channels) {
        if (typeof ch !== 'string')
            throw new Error('element of "channels" must be of string type');
    }
    if (!('format' in param))
        throw new Error('"format" was not specified');
    if (typeof param.format !== 'string')
        throw new Error('"format" must be of string type');
    const start = datetime_1.convertDatetimeParam(param.start);
    let end = datetime_1.convertDatetimeParam(param.end);
    if (typeof param.end === 'number') {
        // if end is in minute, that means end + 60 seconds (exclusive)
        // adding 60 seconds
        end += BigInt('60') * BigInt('1000000000');
    }
    if (end <= start) {
        throw new Error('Invalid date time range "end" <= "start"');
    }
    // deep copy channels parameter
    const channels = JSON.parse(JSON.stringify(param.channels));
    // must return new object so it won't be modified externally
    return {
        exchange: param.exchange,
        channels,
        start,
        end,
        format: param.format,
    };
}
exports.setupFilterRequestSetting = setupFilterRequestSetting;
class FilterRequestImpl {
    constructor(clientSetting, setting) {
        this.clientSetting = clientSetting;
        this.setting = setting;
    }
    async download() {
        const proms = [];
        const startMinute = datetime_1.convertNanosecToMinute(this.setting.start);
        const endMinute = datetime_1.convertNanosecToMinute(this.setting.end);
        for (let minute = startMinute; minute <= endMinute; minute++) {
            proms.push(common_1.downloadFilterShard(this.clientSetting, this.setting.exchange, this.setting.channels, this.setting.start, this.setting.end, minute));
        }
        return Promise.all(proms);
    }
    stream(bufferSize) {
        const clientSetting = this.clientSetting;
        const setting = this.setting;
        return {
            [Symbol.asyncIterator]() {
                return new iterator_1.default(clientSetting, setting, bufferSize);
            },
        };
    }
}
exports.FilterRequestImpl = FilterRequestImpl;
