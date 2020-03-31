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
    subscribed(channels) {
        const topics = channels.map((ch) => `${constants_1.SNAPSHOT_TOPIC_SUBSCRIBED}_${ch}`);
        return this.topics(topics);
    }
    book(pairs) {
        const topics = pairs.map((pair) => `book_${pair}`);
        return this.topics(topics);
    }
    topics(tops) {
        this.stored.push(...tops);
        return this;
    }
    build() {
        // this shallow copies an array
        return this.stored.slice(0);
    }
}
function snapshotBitfinex() {
    return new Impl();
}
exports.snapshotBitfinex = snapshotBitfinex;
