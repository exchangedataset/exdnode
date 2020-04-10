"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("../../client/impl");
const impl_2 = require("./impl");
async function snapshot(clientParam, param) {
    if (typeof clientParam === 'undefined')
        throw new Error("'clientParam' must be specified");
    if (typeof param === 'undefined')
        throw new Error("'param' must be specified");
    return await impl_2.snapshotDownload(impl_1.setupClientSetting(clientParam), impl_2.setupSnapshotRequestSetting(param));
}
exports.snapshot = snapshot;
