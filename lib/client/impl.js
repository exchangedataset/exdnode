"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const base64_1 = require("../utils/base64");
const constants_1 = require("../constants");
const impl_1 = require("../http/impl");
const impl_2 = require("../raw/impl");
const impl_3 = require("../replay/builder/impl");
function setupClientSetting(reference) {
    // take a shallow copy of reference setting as this will be modified
    if (!base64_1.validateBase64(reference.apikey))
        throw new TypeError('Setting "apikey" must be an valid url-safe base64 value');
    let timeout;
    if (typeof reference.timeout === 'undefined') {
        // set default timeout value if it was not set
        timeout = constants_1.CLIENT_DEFAULT_TIMEOUT;
    }
    else if (!Number.isInteger(reference.timeout)) {
        throw new TypeError('Setting "timeout" must be an integer value');
    }
    else {
        timeout = reference.timeout;
    }
    return { apikey: reference.apikey, timeout };
}
exports.setupClientSetting = setupClientSetting;
class ClientImpl {
    constructor(setting) {
        this.setting = setting;
        this.http = new impl_1.HTTPModuleImpl(setting);
    }
    raw(param) {
        return new impl_2.RawRequestImpl(this.setting, impl_2.setupRawRequestSetting(param));
    }
    replay() {
        return new impl_3.ReplayRequestBuilderImpl(this.setting);
    }
}
exports.ClientImpl = ClientImpl;
