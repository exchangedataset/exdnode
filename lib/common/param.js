"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
function checkParamFilter(objContainingFilter) {
    if (!('filter' in objContainingFilter))
        throw new Error('"filter" is undefined, there must be at least one channel to filter.');
    if (Object.keys(objContainingFilter.filter).length === 0)
        throw new Error('"filter" must contain at least one channel to filter, found no exchange.');
    for (const [exchange, channels] of Object.entries(objContainingFilter.filter)) {
        if (typeof exchange !== 'string')
            throw new Error(`"filter" must have exchange as key which is string, found ${typeof exchange}.`);
        if (!Array.isArray(channels))
            throw new Error(`"filter.${exchange}" must be an array of channels.`);
        if (!channels.every((ch) => typeof ch === 'string'))
            throw new Error(`Channels for ${exchange} must be of string type, at least one of them wasn't.`);
    }
}
exports.checkParamFilter = checkParamFilter;
