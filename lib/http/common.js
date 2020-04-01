"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("../common/line");
const stream_1 = require("../utils/stream");
function convertLineType(type) {
    switch (type) {
        case 'ms':
            return line_1.LineType.MESSAGE;
        case 'se':
            return line_1.LineType.SEND;
        case 'st':
            return line_1.LineType.START;
        case 'en':
            return line_1.LineType.END;
        case 'er':
            return line_1.LineType.ERROR;
        default:
            throw new Error(`Message type unknown: ${type}`);
    }
}
/**
 * Download a shard of specified exchange, and minute filtered by channels
 * @param clientSetting
 * @param exchange
 * @param channels
 * @param start This is needed to cut not needed head/tail from the shard
 * @param end Same as above, but excluded (timestamp < end)
 * @param minute
 */
async function downloadShard(clientSetting) {
    // request and download
    const res = await stream_1.httpsGet(clientSetting, `filter/${exchange}/${minute}`, { channels });
    /* check status code and content-type header */
    const { statusCode, headers } = res;
    // 200 = ok, 404 = database not found
    if (statusCode !== 200 && statusCode !== 404) {
        const msg = await readString(res);
        let error;
        try {
            const obj = JSON.parse(msg);
            error = obj.error || obj.message || obj.Message;
        }
        catch (e) {
            error = msg;
        }
        throw new Error(`Request failed: ${statusCode} ${error}\nPlease check the internet connection and the remaining quota of your API key`);
    }
    // check content type
    const contentType = headers['content-type'];
    if (contentType !== 'text/plain') {
        throw new Error(`Invalid response content-type, expected: 'text/plain' got: '${contentType}'`);
    }
    // process stream to get lines
    let lines = [];
    if (statusCode === 200) {
        /* read lines from the response stream */
        lines = await readLines(exchange, res);
    }
    res.destroy();
    // should this head/tail be cut?
    if (convertNanosecToMinute(start) === minute || convertNanosecToMinute(end) === minute) {
        lines = lines.filter((line) => start <= line.timestamp && line.timestamp < end);
    }
    return lines;
}
exports.downloadShard = downloadShard;
