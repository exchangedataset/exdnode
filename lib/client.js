"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const convertNanosecToMinute = (nanosec) => nanosec / BigInt(60) / BigInt(1000000000);
class Client {
    constructor(apikey) {
        this.apikey = apikey;
        if (typeof apikey !== 'string')
            throw new TypeError('An API key must be of string type');
        if (!utils_1.urlsafeBase64Validate(apikey))
            throw new TypeError('An API key provided is not in a url-safe base64 format');
        this.apikey = apikey;
    }
    async filter(exchange, start, end, channels) {
        /* convert date into utc nanosec (extends unixtime) */
        startNanosec = convertDatetimeParam(start);
        endNanosec = convertDatetimeParam(end);
        const shard = await getShard(this.apikey, exchange, start);
        // reader.on('line', (line) => {
        //   console.log('line', line);
        // });
        // reader.on('close', () => {
        // });
        return shard;
    }
    ;
}
exports.default = Client;
