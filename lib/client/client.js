"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
/**
 * Create new Client class instance and returns it.
 * @param config Config to be used in the client instance.
 * @returns Created client with config specified with `config` parameter.
 * @see ClientParam
 */
function createClient(config) {
    const setting = impl_1.setupSetting(config);
    return new impl_1.ClientImpl(setting);
}
exports.createClient = createClient;
