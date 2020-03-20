"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const request_impl_1 = require("./request.impl");
class FilterRequestBuilderImpl {
    constructor(clientSetting) {
        this.clientSetting = clientSetting;
        // initialize filter
        this.config = { filter: {} };
    }
    build() {
        // we can deep clone filter object like this because filter object only has strings
        const config = JSON.parse(JSON.stringify(this.config));
        return new request_impl_1.FilterRequestImpl(this.clientSetting, request_impl_1.setupSetting(config));
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
        return this.configure(this.config);
    }
    asCSVLike() {
        this.config.format = 'csvlike';
        return this.configure(this.config);
    }
    configure(params) {
        return new request_impl_1.FilterRequestImpl(this.clientSetting, request_impl_1.setupSetting(params));
    }
}
exports.FilterRequestBuilderImpl = FilterRequestBuilderImpl;
