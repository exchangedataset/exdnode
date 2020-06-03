"use strict";
/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
const impl_1 = require("../raw/impl");
const common_1 = __importDefault(require("./common"));
const stream_1 = require("./stream");
function convertReplayFilterToRawFilter(param) {
    const filter = {};
    for (const [exchange, channels] of Object.entries(param)) {
        if (exchange === "bitmex") {
            const set = new Set();
            for (const channel of channels) {
                if (channel.startsWith("orderBookL2")) {
                    set.add("orderBookL2");
                }
                else if (channel.startsWith("trade")) {
                    set.add("trade");
                }
                else {
                    set.add(channel);
                }
            }
            filter[exchange] = Array.from(set);
        }
        else {
            filter[exchange] = channels;
        }
    }
    return filter;
}
exports.convertReplayFilterToRawFilter = convertReplayFilterToRawFilter;
function setupReplayRequestSetting(param) {
    if (!('start' in param))
        throw new Error('"start" date time was not specified');
    if (!('end' in param))
        throw new Error('"end" date time was not specified');
    param_1.checkParamFilter(param);
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
    };
}
exports.setupReplayRequestSetting = setupReplayRequestSetting;
class ReplayRequestImpl {
    constructor(clientSetting, setting) {
        this.clientSetting = clientSetting;
        this.setting = setting;
    }
    async download() {
        const req = new impl_1.RawRequestImpl(this.clientSetting, impl_1.setupRawRequestSetting({
            filter: convertReplayFilterToRawFilter(this.setting.filter),
            start: this.setting.start,
            end: this.setting.end,
            format: "json",
        }));
        const postFilter = {};
        for (const [exchange, channels] of Object.entries(this.setting.filter)) {
            postFilter[exchange] = new Set();
            for (const channel of channels) {
                postFilter[exchange].add(channel);
            }
        }
        const array = await req.download();
        const result = Array(array.length);
        const processor = new common_1.default();
        let j = 0;
        for (let i = 0; i < array.length; i++) {
            const processed = processor.processRawLines(array[i]);
            if (processed === null) {
                continue;
            }
            if (!postFilter[processed.exchange].has(processed.channel)) {
                continue;
            }
            result[j] = processed;
            j++;
        }
        return result.slice(0, j);
    }
    stream() {
        const { clientSetting, setting } = this;
        return {
            [Symbol.asyncIterator]() {
                return new stream_1.ReplayStreamIterator(clientSetting, setting);
            },
        };
    }
}
exports.ReplayRequestImpl = ReplayRequestImpl;
