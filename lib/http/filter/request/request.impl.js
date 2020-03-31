"use strict";
/**
 * @internal
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datetime_1 = require("../../../utils/datetime");
const download_1 = __importDefault(require("../download"));
const iterator_1 = __importDefault(require("../stream/iterator"));
function setupSetting(params) {
    if (!('start' in params))
        throw new Error('"start" date time was not specified.');
    if (!('end' in params))
        throw new Error('"end" date time was not specified.');
    // type check for those parameter will be done in convertDatetimeParam function
    if (!('filter' in params))
        throw new Error('"filter" is undefined, there must be at least one channel to filter.');
    if (Object.keys(params.filter).length === 0)
        throw new Error('"filter" must contain at least one channel to filter, found no exchange.');
    for (const [exchange, channels] of Object.entries(params.filter)) {
        if (typeof exchange !== 'string')
            throw new Error(`"filter" must have exchange as key which is string, found ${typeof exchange}.`);
        if (!Array.isArray(channels))
            throw new Error(`"filter.${exchange}" must be an array of channels.`);
        if (!channels.every((ch) => typeof ch === 'string'))
            throw new Error(`Channels for ${exchange} must be of string type, at least one of them wasn't.`);
    }
    if (!('format' in params))
        throw new Error('"format" was not specified.');
    if (typeof params.format !== 'string')
        throw new Error('"format" must be of string type');
    const start = datetime_1.convertDatetimeParam(params.start);
    let end = datetime_1.convertDatetimeParam(params.end);
    if (typeof params.end === 'number') {
        // if end is in minute, that means end + 60 seconds (exclusive)
        // adding 60 seconds
        end += BigInt('60') * BigInt('1000000000');
    }
    // end in nanosec is exclusive
    end -= BigInt('1');
    if (end <= start) {
        throw new Error('Invalid date time range "end" <= "start"');
    }
    // deep copy filter parameter
    const filter = JSON.parse(JSON.stringify(params.filter));
    // must return new object so it won't be modified externally
    return {
        filter,
        start,
        end,
        format: params.format,
    };
}
exports.setupSetting = setupSetting;
class FilterRequestImpl {
    constructor(clientSetting, setting) {
        this.clientSetting = clientSetting;
        this.setting = setting;
    }
    download() {
        return download_1.default(this.clientSetting, this.setting);
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
