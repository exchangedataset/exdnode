"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
class Impl {
    constructor() {
        this.stored = [];
    }
    trades(pairs) {
        const chs = pairs.map((pair) => `trades_${pair}`);
        return this.channels(chs);
    }
    book(pairs) {
        const chs = pairs.map((pair) => `book_${pair}`);
        return this.channels(chs);
    }
    channels(chs) {
        this.stored.push(...chs);
        return this;
    }
    build() {
        // this shallow copies an array
        return this.stored.slice(0);
    }
}
function bitfinex() {
    return new Impl();
}
exports.bitfinex = bitfinex;
