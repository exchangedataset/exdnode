"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base64_1 = require("./utils/base64");
const filter_1 = require("./filter/filter");
const variables_1 = require("./variables");
function setupSetting(reference) {
    // take a shallow copy of reference setting as this will be modified
    if (!base64_1.validateBase64(reference.apikey))
        throw new TypeError('Setting "apikey" must be an valid url-safe base64 value');
    let timeout;
    if (typeof reference.timeout === 'undefined') {
        // set default timeout value if it was not set
        timeout = variables_1.CLIENT_DEFAULT_TIMEOUT;
    }
    else if (!Number.isInteger(reference.timeout)) {
        throw new TypeError('Setting "timeout" must be an integer value');
    }
    else {
        timeout = reference.timeout;
    }
    return { apikey: reference.apikey, timeout };
}
class Client {
    constructor(setting) {
        this.setting = setupSetting(setting);
    }
    async filter(exchange, start, end, channels) {
        /* convert date into utc nanosec (extends unixtime) */
        const startNanosec = convertDatetimeParam(start);
        const endNanosec = convertDatetimeParam(end);
        const shard = await filter(this.apikey, exchange, start);
        // reader.on('line', (line) => {
        //   console.log('line', line);
        // });
        // reader.on('close', () => {
        // });
        return new filter_1.FilterStreamImpl(this.setting, exchange, start, end, channels);
    }
    ;
}
exports.Client = Client;
/**
 * Create new Client class instance and returns it.
 *
 * This is identical to `new Client(ClientSetting)`.
 * {@link ClientSetting}
 * @param setting Setting to be used in the client instance.
 * @returns Created client with setting specified with `setting` parameter.
 */
function createClient(setting) {
    return new Client(setting);
}
exports.createClient = createClient;
