"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("../http/filter/impl");
const impl_2 = require("../http/snapshot/impl");
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
    const snapshotProms = [];
    const filterProms = [];
    for (const [exchange, channels] of entries) {
        const ss = new impl_2.SnapshotRequestImpl(clientSetting, impl_2.setupSnapshotRequestSetting({
            exchange,
            channels,
            at: setting.start,
            format: setting.format,
        }));
        snapshotProms.push(ss.download().then((sss) => sss.map((ss) => common_1.convertSnapshotToLine(exchange, ss))));
        const freq = new impl_1.FilterRequestImpl(clientSetting, impl_1.setupFilterRequestSetting({
            exchange,
            channels,
            start: setting.start,
            end: setting.end,
            format: setting.format,
        }));
        filterProms.push(freq.download());
    }
    // wait download and processing of all shards
    const result = await Promise.all([Promise.all(snapshotProms), Promise.all(filterProms)]);
    // set shards to map from array index
    const snapshotResult = result[0];
    const filterResult = result[1];
    for (let i = 0; i < entries.length; i++) {
        const [exchange] = entries[i];
        map[exchange] = [snapshotResult[i], ...filterResult[i]];
    }
    return map;
}
async function download(clientSetting, setting) {
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
exports.default = download;
