"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("../client/impl");
const impl_2 = require("./impl");
function replay(clientParam, param) {
    return new impl_2.ReplayRequestImpl(impl_1.setupClientSetting(clientParam), impl_2.setupReplayRequestSetting(param));
}
exports.replay = replay;
__export(require("./builder/builder"));
