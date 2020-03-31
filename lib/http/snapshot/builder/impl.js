"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const request_impl_1 = require("../request.impl");
const impl_1 = require("../impl");
class SnapshotRequestBuilderImpl {
    constructor(clientSetting) {
        this.clientSetting = clientSetting;
        this.param = {};
    }
    bitmex(topics) {
        return this.exchange('bitmex', topics);
    }
    bitfinex(topics) {
        return this.exchange('bitflyer', topics);
    }
    bitflyer(topics) {
        return this.exchange('bitfinex', topics);
    }
    exchange(exchange, topics) {
        if (!(exchange in this.param)) {
            this.param.filter[exchange] = topics;
            return this;
        }
        this.param.filter[exchange].push(...topics);
        return this;
    }
    at(datetime) {
        this.param.at = datetime;
        return this;
    }
    asRaw() {
        this.param.format = 'raw';
        return this.build();
    }
    asCSVLike() {
        this.param.format = 'csvlike';
        return this.build();
    }
    build() {
        return new request_impl_1.SnapshotRequestImpl(this.clientSetting, impl_1.setupSetting(this.param));
    }
}
exports.SnapshotRequestBuilderImpl = SnapshotRequestBuilderImpl;
