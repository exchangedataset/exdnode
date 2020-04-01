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
async function readResponse(exchange, res) {
    return new Promise((resolve, reject) => {
        const lineStream = readline_1.default.createInterface({
            input: res,
        });
        const lineArr = [];
        lineStream.on('line', (line) => {
            const split = line.split('\t', 3);
            // it has no additional information
            lineArr.push({
                channel: split[0],
                timestamp: BigInt(split[1]),
                snapshot: split[2],
            });
        });
        lineStream.on('error', (error) => reject(error));
        lineStream.on('close', () => resolve(lineArr));
    });
}
class SnapshotRequestImpl {
    constructor(clientSetting, setting) {
        this.clientSetting = clientSetting;
        this.setting = setting;
    }
    async download() {
        const res = await download_1.getResponse(this.clientSetting, `snapshot/${this.setting.exchange}/${this.setting.at}`, { topics: this.setting.channels });
        return await readResponse(this.setting.exchange, res);
    }
}
exports.SnapshotRequestImpl = SnapshotRequestImpl;
