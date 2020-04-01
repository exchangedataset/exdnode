"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const param_1 = require("../common/param");
const datetime_1 = require("../utils/datetime");
function setupReplayRequestSetting(param) {
    if (!('start' in param))
        throw new Error('"start" date time was not specified');
    if (!('end' in param))
        throw new Error('"end" date time was not specified');
    param_1.checkParamFilter(param);
    const start = datetime_1.convertDatetimeParam(param.start);
    let end = datetime_1.convertDatetimeParam(param.end);
    if (typeof param.end === 'number') {
        end += BigInt('60') * BigInt('1000000000');
    }
    if (end <= start) {
        throw new Error('Invalid date time range "end" <= "start"');
    }
    const filter = JSON.parse(JSON.stringify(param.filter));
    return {
        filter,
        start,
        end,
    };
}
exports.setupReplayRequestSetting = setupReplayRequestSetting;
class ReplayRequestImpl {
    constructor(clientSetting, setting) {
        this.clientSetting = clientSetting;
        this.setting = setting;
    }
    download() {
        throw new Error("Method not implemented.");
    }
    stream() {
        throw new Error("Method not implemented.");
    }
}
exports.ReplayRequestImpl = ReplayRequestImpl;
