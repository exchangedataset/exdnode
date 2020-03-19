"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Impl {
    constructor() {
        this.stored = [];
    }
    announcement() { return this.channels('announcement'); }
    chat() { return this.channels('chat'); }
    connected() { return this.channels('connected'); }
    funding() { return this.channels('funding'); }
    instrument() { return this.channels('instrument'); }
    insurance() { return this.channels('insurance'); }
    liquidation() { return this.channels('liquidation'); }
    orderBookL2() { return this.channels('orderBookL2'); }
    publicNotifications() { return this.channels('publicNotifications'); }
    settlement() { return this.channels('settlement'); }
    trade() { return this.channels('trade'); }
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
function filterBitmex() {
    return new Impl();
}
exports.filterBitmex = filterBitmex;