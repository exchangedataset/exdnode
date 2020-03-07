"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
/**
 * Create new Client class instance and returns it.
 *
 * This is identical to `new Client(ClientParam)`.
 *
 * @param params Setting to be used in the client instance.
 * @returns Created client with setting specified with `setting` parameter.
 * @see ClientParam
 */
function createClient(params) {
    const setting = impl_1.setupSetting(params);
    return new impl_1.ClientImpl(setting);
}
exports.createClient = createClient;
