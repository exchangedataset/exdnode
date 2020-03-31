"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const request_impl_1 = require("../request.impl");
const impl_1 = require("../impl");
class FilterRequestBuilderImpl {
    constructor(clientSetting) {
        this.clientSetting = clientSetting;
        // initialize filter
        this.config = { filter: {} };
    }
    build() {
        return new request_impl_1.FilterRequestImpl(this.clientSetting, impl_1.setupSetting(this.config));
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
        if (!(exchangeName in this.config)) {
            this.config.filter[exchangeName] = channels;
            return this;
        }
        this.config.filter[exchangeName].push(...channels);
        return this;
    }
    start(date) {
        this.config.start = date;
        return this;
    }
    end(date) {
        this.config.end = date;
        return this;
    }
    range(start, end) {
        return this.start(start).end(typeof end === 'undefined' ? start : end);
    }
    asRaw() {
        this.config.format = 'none';
        return this.build();
    }
    asCSVLike() {
        this.config.format = 'csvlike';
        return this.build();
    }
}
exports.FilterRequestBuilderImpl = FilterRequestBuilderImpl;
