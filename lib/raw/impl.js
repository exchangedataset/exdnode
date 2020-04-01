"use strict";
/**
 * @internal
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const param_1 = require("../common/param");
const datetime_1 = require("../utils/datetime");
const download_1 = __importDefault(require("./download"));
const iterator_1 = __importDefault(require("./iterator"));
function setupRawRequestSetting(param) {
    if (!('start' in param))
        throw new Error('"start" date time was not specified');
    if (!('end' in param))
        throw new Error('"end" date time was not specified');
    param_1.checkParamFilter(param);
    if (!('format' in param))
        throw new Error('"format" was not specified');
    if (typeof param.format !== 'string')
        throw new Error('"format" must be of string type');
    const start = datetime_1.convertDatetimeParam(param.start);
    let end = datetime_1.convertDatetimeParam(param.end);
    if (typeof param.end === 'number') {
        end += BigInt('60') * BigInt('1000000000');
    }
    if (end <= start) {
        throw new Error('Invalid date time range "end" <= "start"');
    }
    const filter = JSON.parse(JSON.stringify(param.filter));
    return {
        filter,
        start,
        end,
        format: param.format,
    };
}
exports.setupRawRequestSetting = setupRawRequestSetting;
class RawRequestImpl {
    constructor(clientSetting, setting) {
        this.clientSetting = clientSetting;
        this.setting = setting;
    }
    async download() {
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
exports.RawRequestImpl = RawRequestImpl;
