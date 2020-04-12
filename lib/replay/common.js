"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("../common/line");
function processRawLines(defs, line) {
    // convert result if it needs
    if (line.type !== line_1.LineType.MESSAGE) {
        return line;
    }
    const exchange = line.exchange;
    const channel = line.channel;
    if (!(exchange in defs)) {
        // this is the first line for this exchange
        defs[exchange] = {
            [channel]: JSON.parse(line.message)
        };
        return null;
    }
    if (!(channel in defs[exchange])) {
        defs[exchange][channel] = JSON.parse(line.message);
        return null;
    }
    const result = JSON.parse(line.message);
    const header = defs[exchange][channel];
    for (const [name, type] of Object.entries(header)) {
        if (type === "timestamp") {
            // convert timestamp type parameter into bigint
            result[name] = BigInt(result[name]);
        }
    }
    let newChannel = line.channel;
    if (line.exchange === "bitmex") {
        if (line.channel === "orderBookL2") {
            newChannel = `orderBookL2_${result.pair}`;
        }
        else if (line.channel === "trade") {
            newChannel = `trade_${result.pair}`;
        }
    }
    return {
        type: line.type,
        timestamp: line.timestamp,
        exchange: line.exchange,
        channel: newChannel,
        message: result,
    };
}
exports.processRawLines = processRawLines;
