"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("../../client/impl");
const impl_2 = require("./impl");
/**
 * Returns `Promise` of {@link FilterRequest} for given client and filter parameter.
 * @param clientParam Client parameter
 * @param param Filter parameter
 */
async function filter(clientParam, param) {
    if (typeof clientParam === 'undefined')
        throw new Error("'clientParam' must be specified");
    if (typeof param === 'undefined')
        throw new Error("'param' must be specified");
    return await impl_2.filterDownload(impl_1.setupClientSetting(clientParam), impl_2.setupFilterRequestSetting(param));
}
exports.filter = filter;
