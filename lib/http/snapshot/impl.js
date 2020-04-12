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
const datetime_1 = require("../../utils/datetime");
const download_1 = require("../../common/download");
function setupSnapshotRequestSetting(param) {
    if (!('at' in param))
        throw new Error('"at" date time was not specified');
    if (!('exchange' in param))
        throw new Error('"exchange" was not specified');
    if (!('channels' in param))
        throw new Error('"topics" was not specified');
    for (const ch of param.channels) {
        if (typeof ch !== 'string')
            throw new Error('element of "channels" must be of string type');
    }
    if (!('format' in param))
        throw new Error('"format" was not specified');
    if (typeof param.format !== 'string')
        throw new Error('"format" must be of string type');
    const topics = JSON.parse(JSON.stringify(param.channels));
    return {
        exchange: param.exchange,
        channels: topics,
        at: datetime_1.convertDatetimeParam(param.at),
        format: param.format,
    };
}
exports.setupSnapshotRequestSetting = setupSnapshotRequestSetting;
async function readResponse(stream) {
    return new Promise((resolve, reject) => {
        const lineStream = readline_1.default.createInterface({
            input: stream,
        });
        const lineArr = [];
        lineStream.on('line', (line) => {
            const split = line.split('\t', 3);
            // it has no additional information
            lineArr.push({
                timestamp: BigInt(split[0]),
                channel: split[1],
                snapshot: split[2],
            });
        });
        stream.on('error', (error) => reject(new Error(`Catched upper stream error: ${error.message}`)));
        lineStream.on('error', (error) => reject(new Error(`Catched line stream error: ${error.message}`)));
        lineStream.on('close', () => resolve(lineArr));
    });
}
async function snapshotDownload(clientSetting, setting) {
    const res = await download_1.getResponse(clientSetting, `snapshot/${setting.exchange}/${setting.at}`, {
        channels: setting.channels,
        format: setting.format,
    });
    if (res.statusCode === 200) {
        return await readResponse(res.stream);
    }
    else {
        // 404, no dataset was found
        return [];
    }
}
exports.snapshotDownload = snapshotDownload;
