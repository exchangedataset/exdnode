"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
function filterBuilder() {
    return new impl_1.FilterBuilderImpl();
}
exports.filterBuilder = filterBuilder;
__export(require("./bitmex"));
__export(require("./bitflyer"));
__export(require("./bitfinex"));
