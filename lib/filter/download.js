"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datetime_1 = require("../utils/datetime");
const common_1 = require("./common");
class ShardsLineIterator {
    constructor(shards) {
        this.shards = shards;
        this.position = 0;
    }
    next() {
        // find the line to return
        while (this.shards.length > 0 && this.shards[0].length <= this.position) {
            // this shard is all read
            this.shards.shift();
            this.position = 0;
        }
        if (this.shards.length === 0) {
            // there is no line left
            return {
                done: true,
                value: null,
            };
        }
        // return the line
        const line = this.shards[0][this.position];
        this.position += 1;
        return {
            done: false,
            value: line,
        };
    }
}
async function downloadAllShards(clientSetting, setting) {
    const entries = Object.entries(setting.filter);
    // initialize an array to store all shards
    const map = Object.fromEntries(entries.map(([exchange]) => [exchange, []]));
    const startMinute = datetime_1.convertNanosecToMinute(setting.start);
    const endMinute = datetime_1.convertNanosecToMinute(setting.end);
    const proms = [];
    for (const [exchange, channels] of entries) {
        const exchProms = [];
        for (let minute = startMinute; minute <= endMinute; minute++) {
            exchProms.push(common_1.downloadShard(clientSetting, exchange, channels, setting.start, setting.end, minute));
        }
        proms.push(Promise.all(exchProms));
    }
    // wait download and processing of all shards
    const result = await Promise.all(proms);
    // set shards to map from array index
    for (let i = 0; i < entries.length; i++) {
        const [exchange] = entries[i];
        map[exchange] = result[i];
    }
    return map;
}
async function filterDownload(clientSetting, setting) {
    // download all shards, returns an array of shards for each exchange
    const map = await downloadAllShards(clientSetting, setting);
    // stores iterator and last line for each exchange
    const states = {};
    const exchanges = [];
    for (const [exchange, shards] of Object.entries(map)) {
        const itr = new ShardsLineIterator(shards);
        const next = itr.next();
        // if there was no line, ignore this exchange's shards
        if (!next.done) {
            states[exchange] = { iterator: itr, lastLine: next.value };
            exchanges.push(exchange);
        }
    }
    /* it needs to process lines so that it becomes a single array */
    // array to store the result
    const array = [];
    while (exchanges.length > 0) {
        // have to set initial value to calculate minimun value
        let argmin = exchanges.length - 1;
        const tmpLine = states[exchanges[argmin]].lastLine;
        let min = tmpLine.timestamp;
        // must start from the end because it needs to remove its elements
        for (let i = exchanges.length - 2; i >= 0; i--) {
            const exchange = exchanges[i];
            const line = states[exchange].lastLine;
            if (line.timestamp < min) {
                min = line.timestamp;
                argmin = i;
            }
        }
        const state = states[exchanges[argmin]];
        // push the line
        array.push(state.lastLine);
        // find the next line for this exchange, if does not exist, remove the exchange
        const next = state.iterator.next();
        if (next.done) {
            // next line is absent
            exchanges.splice(argmin, 1);
        }
        state.lastLine = next.value;
    }
    return array;
}
exports.default = filterDownload;
