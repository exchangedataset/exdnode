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
        lineStream.on('error', (error) => reject(error));
        lineStream.on('close', () => resolve(lineArr));
    });
}
/**
 * Download a shard of specified exchange, and minute filtered by channels
 * @param clientSetting
 * @param exchange
 * @param channels
 * @param start This is needed to cut not needed head/tail from the shard
 * @param end Same as above, but excluded (timestamp < end)
 * @param minute
 */
async function downloadFilterShard(clientSetting, exchange, channels, start, end, minute) {
    // request and download
    const res = await download_1.getResponse(clientSetting, `filter/${exchange}/${minute}`, { channels });
    // process stream to get lines
    let lines = [];
    if (res.statusCode === 200) {
        /* read lines from the response stream */
        lines = await readLines(exchange, res);
    }
    res.destroy();
    // should this head/tail be cut?
    if (datetime_1.convertNanosecToMinute(start) === minute || datetime_1.convertNanosecToMinute(end) === minute) {
        lines = lines.filter((line) => start <= line.timestamp && line.timestamp < end);
    }
    return lines;
}
exports.downloadFilterShard = downloadFilterShard;
