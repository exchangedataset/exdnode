"use strict";
/**
 * @internal
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const line_1 = require("../../common/line");
const datetime_1 = require("../../utils/datetime");
const download_1 = require("../../common/download");
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
    if (!('minute' in param))
        throw new Error('"minute" was not specified');
    if (typeof param.minute !== 'number')
        throw new Error('"minute" must be of number type');
    if (!Number.isInteger(param.minute))
        throw new Error('"minute" must be of integer');
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
        minute: param.minute,
        format: param.format,
    };
}
exports.setupFilterRequestSetting = setupFilterRequestSetting;
function convertLineType(type) {
    switch (type) {
        case 'ms':
            return line_1.LineType.MESSAGE;
        case 'se':
            return line_1.LineType.SEND;
        case 'st':
            return line_1.LineType.START;
        case 'en':
            return line_1.LineType.END;
        case 'er':
            return line_1.LineType.ERROR;
        default:
            throw new Error(`Message type unknown: ${type}`);
    }
}
async function readLines(exchange, stream) {
    return new Promise((resolve, reject) => {
        const lineStream = readline_1.default.createInterface({
            input: stream,
        });
        const lineArr = [];
        lineStream.on('line', (line) => {
            const prefix = line.slice(0, 2);
            let split;
            switch (prefix) {
                case 'ms':
                    // message or send have 4 section
                    split = line.split('\t', 4);
                    lineArr.push({
                        exchange,
                        type: line_1.LineType.MESSAGE,
                        timestamp: BigInt(split[1]),
                        channel: split[2],
                        message: split[3],
                    });
                    break;
                case 'se':
                    split = line.split('\t', 4);
                    lineArr.push({
                        exchange,
                        type: line_1.LineType.SEND,
                        timestamp: BigInt(split[1]),
                        channel: split[2],
                        message: split[3],
                    });
                    break;
                case 'st':
                    // start or error have 3 section without channel
                    split = line.split('\t', 3);
                    lineArr.push({
                        exchange,
                        type: line_1.LineType.START,
                        timestamp: BigInt(split[1]),
                        message: split[2]
                    });
                    break;
                case 'er':
                    split = line.split('\t', 3);
                    lineArr.push({
                        exchange,
                        type: line_1.LineType.ERROR,
                        timestamp: BigInt(split[1]),
                        message: split[2]
                    });
                    break;
                default:
                    split = line.split('\t', 2);
                    // it has no additional information
                    lineArr.push({
                        exchange,
                        type: convertLineType(split[0]),
                        timestamp: BigInt(split[1])
                    });
                    break;
            }
        });
        stream.on('error', (error) => reject(new Error(`Catched upper stream error: ${error.message}`)));
        lineStream.on('error', (error) => reject(new Error(`Catched line stream error: ${error.message}`)));
        lineStream.on('close', () => resolve(lineArr));
    });
}
async function filterDownload(clientSetting, setting) {
    // request and download
    const res = await download_1.getResponse(clientSetting, `filter/${setting.exchange}/${setting.minute}`, {
        channels: setting.channels,
        start: setting.start.toString(),
        end: setting.end.toString(),
        format: setting.format,
    });
    // process stream to get lines
    let lines = [];
    if (res.statusCode === 200) {
        /* read lines from the response stream */
        lines = await readLines(setting.exchange, res.stream);
    }
    res.stream.destroy();
    return lines;
}
exports.filterDownload = filterDownload;
