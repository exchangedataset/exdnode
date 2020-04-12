"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("../impl");
class ReplayRequestBuilderImpl {
    constructor(clientSetting) {
        this.clientSetting = clientSetting;
        this.config = {
            filter: {},
        };
    }
    build() {
        return new impl_1.ReplayRequestImpl(this.clientSetting, impl_1.setupReplayRequestSetting(this.config));
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
}
exports.ReplayRequestBuilderImpl = ReplayRequestBuilderImpl;
