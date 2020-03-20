"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
class Impl {
    constructor() {
        this.stored = [];
    }
    executions(...pairs) {
        const chs = pairs.map((pair) => `lightning_executions_${pair}`);
        return this.channels(...chs);
    }
    boardSnapshot(...pairs) {
        const chs = pairs.map((pair) => `lightning_board_snapshot_${pair}`);
        return this.channels(...chs);
    }
    board(...pairs) {
        const chs = pairs.map((pair) => `lightning_board_${pair}`);
        return this.channels(...chs);
    }
    ticker(...pairs) {
        const chs = pairs.map((pair) => `lightning_ticker_${pair}`);
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
function filterBitflyer() {
    return new Impl();
}
exports.filterBitflyer = filterBitflyer;
