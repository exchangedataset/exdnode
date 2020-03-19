"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FilterBuilderImpl {
    constructor() {
        // initialize filter
        this.filter = {};
    }
    build() {
        // we can deep clone filter object like this because filter object only has strings
        return JSON.parse(JSON.stringify(this.filter));
    }
    bitmex(channels) {
        return this.exchange('bitmex', channels);
    }
    bitflyer(channels) {
        return this.exchange('bitflyer', channels);
    }
    bitfinex(channels) {
        return this.exchange('bitfinex', channels);
    }
    exchange(exchangeName, channels) {
        if (!(exchangeName in this.filter)) {
            this.filter[exchangeName] = channels;
            return this;
        }
        // channels for this exchange are already pushed, add channles to it
        // remove duplicate from channels parameter
        const noduplicate = channels.filter((ch) => !(ch in this.filter.channels));
        this.filter.channels.push(...noduplicate);
        return this;
    }
}
exports.FilterBuilderImpl = FilterBuilderImpl;
