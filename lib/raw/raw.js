"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("../client/impl");
const impl_2 = require("./impl");
function raw(clientParam, param) {
    return new impl_2.RawRequestImpl(impl_1.setupClientSetting(clientParam), impl_2.setupRawRequestSetting(param));
}
exports.raw = raw;
