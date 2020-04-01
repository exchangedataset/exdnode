"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("../common/line");
function convertSnapshotToLine(exchange, snapshot) {
    return {
        exchange,
        timestamp: snapshot.timestamp,
        type: line_1.LineType.MESSAGE,
        channel: snapshot.channel,
        message: snapshot.snapshot,
    };
}
exports.convertSnapshotToLine = convertSnapshotToLine;
