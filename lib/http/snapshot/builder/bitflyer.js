"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
/**
 * @internal
 */
class Impl {
    constructor() {
        this.stored = [];
    }
    subscribed(chs) {
        const tops = chs.map((ch) => `${constants_1.SNAPSHOT_TOPIC_SUBSCRIBED}_${ch}`);
        return this.topics(tops);
    }
    boardSnapshot(pairs) {
        const chs = pairs.map((pair) => `lightning_board_snapshot_${pair}`);
        return this.topics(chs);
    }
    topics(chs) {
        this.stored.push(...chs);
        return this;
    }
    build() {
        // this shallow copies an array
        return this.stored.slice(0);
    }
}
function filterBitflyer() {
    return new Impl();
}
exports.filterBitflyer = filterBitflyer;
