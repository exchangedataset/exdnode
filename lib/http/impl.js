"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./filter/impl");
const impl_2 = require("./snapshot/impl");
class HTTPModuleImpl {
    constructor(setting) {
        this.setting = setting;
    }
    filter(param) {
        return new impl_1.FilterRequestImpl(this.setting, impl_1.setupFilterRequestSetting(param));
    }
    snapshot(param) {
        return new impl_2.SnapshotRequestImpl(this.setting, impl_2.setupSnapshotRequestSetting(param));
    }
}
exports.HTTPModuleImpl = HTTPModuleImpl;
