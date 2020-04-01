"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("../../client/impl");
const impl_2 = require("./impl");
/**
 * Returns {@link FilterRequest} for given client and filter parameter.
 * @param clientParams Client parameter
 * @param params Filter parameter
 */
function filter(clientParams, params) {
    return new impl_2.FilterRequestImpl(impl_1.setupClientSetting(clientParams), impl_2.setupFilterRequestSetting(params));
}
exports.filter = filter;
