"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const builder_impl_1 = require("./filter/request/builder.impl");
class HTTPModuleImpl {
    constructor(setting) {
        this.setting = setting;
    }
    filter() {
        return new builder_impl_1.FilterRequestBuilderImpl(this.setting);
    }
}
exports.HTTPModuleImpl = HTTPModuleImpl;
