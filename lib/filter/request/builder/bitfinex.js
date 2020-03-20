"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
class Impl {
    constructor() {
        this.stored = [];
    }
    trades(...pairs) {
        const chs = pairs.map((pair) => `trades_${pair}`);
        return this.channels(...chs);
    }
    book(...pairs) {
        const chs = pairs.map((pair) => `book_${pair}`);
        return this.channels(...chs);
    }
    channels(...chs) {
        const noduplicate = chs.filter((ch) => !(ch in this.channels));
        this.stored.push(...noduplicate);
        return this;
    }
    build() {
        // this shallow copies an array
        return this.stored.slice(0);
    }
}
function filterBitfinex() {
    return new Impl();
}
exports.filterBitfinex = filterBitfinex;
