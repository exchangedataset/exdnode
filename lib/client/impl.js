"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const base64_1 = require("../utils/base64");
const constants_1 = require("../constants");
const impl_1 = require("../http/snapshot/impl");
function setupSetting(reference) {
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
exports.setupSetting = setupSetting;
class ClientImpl {
    constructor(setting) {
        this.setting = setting;
        this.http = new impl_1.HTTPModuleImpl(setting);
    }
}
exports.ClientImpl = ClientImpl;
