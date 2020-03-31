"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const request_impl_1 = require("./request.impl");
const impl_1 = require("../../client/impl");
const impl_2 = require("./impl");
function snapshot(clientParam, param) {
    return new request_impl_1.SnapshotRequestImpl(impl_1.setupSetting(clientParam), impl_2.setupSetting(param));
}
exports.snapshot = snapshot;
__export(require("./request"));
