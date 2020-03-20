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
const download_1 = __importDefault(require("../download"));
const iterator_1 = __importDefault(require("../stream/iterator"));
function setupSetting(params) {
    const start = datetime_1.convertDatetimeParam(params.start);
    let end = datetime_1.convertDatetimeParam(params.end);
    if (typeof params.end === 'number') {
        // if end is in minute, that means end + 60 seconds (exclusive)
        // adding 60 seconds
        end += BigInt('60') * BigInt('1000000000');
    }
    // end in nanosec is exclusive
    end -= BigInt('1');
    // deep copy filter parameter
    const filter = JSON.parse(JSON.stringify(params.filter));
    // must return new object so it won't be modified externally
    return {
        filter,
        start,
        end,
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
