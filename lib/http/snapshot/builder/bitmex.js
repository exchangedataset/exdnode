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
    orderBookL2() { return this.topics(['orderBookL2']); }
    topics(tops) {
        this.stored.push(...tops);
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
