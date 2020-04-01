"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("../../client/impl");
const impl_2 = require("./impl");
function snapshot(clientParam, param) {
    return new impl_2.SnapshotRequestImpl(impl_1.setupClientSetting(clientParam), impl_2.setupSnapshotRequestSetting(param));
}
exports.snapshot = snapshot;
