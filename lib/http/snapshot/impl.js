"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("../filter/builder/impl");
const datetime_1 = require("../../utils/datetime");
function setupSetting(param) {
    if (!('at' in param))
        throw new Error('"at" date time was not specified.');
    if (!('filter' in param))
        throw new Error('"filter" is undefined, there must be at least one channel to filter.');
    if (Object.keys(param.filter).length === 0)
        throw new Error('"filter" must contain at least one channel to filter, found no exchange.');
    for (const [exchange, channels] of Object.entries(param.filter)) {
        if (typeof exchange !== 'string')
            throw new Error(`"filter" must have exchange as key which is string, found ${typeof exchange}.`);
        if (!Array.isArray(channels))
            throw new Error(`"filter.${exchange}" must be an array of channels.`);
        if (!channels.every((ch) => typeof ch === 'string'))
            throw new Error(`Channels for ${exchange} must be of string type, at least one of them wasn't.`);
    }
    if (!('format' in param))
        throw new Error('"format" was not specified.');
    if (typeof param.format !== 'string')
        throw new Error('"format" must be of string type');
    const filter = JSON.parse(JSON.stringify(param.filter));
    return {
        filter,
        at: datetime_1.convertDatetimeParam(param.at),
        format: param.format,
    };
}
exports.setupSetting = setupSetting;
class HTTPModuleImpl {
    constructor(setting) {
        this.setting = setting;
    }
    snapshot() {
        throw new Error("Method not implemented.");
    }
    filter() {
        return new impl_1.FilterRequestBuilderImpl(this.setting);
    }
}
exports.HTTPModuleImpl = HTTPModuleImpl;
