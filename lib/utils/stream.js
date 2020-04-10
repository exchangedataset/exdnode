"use strict";
/**
 * @internal
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const querystring_1 = __importDefault(require("querystring"));
const constants_1 = require("../constants");
/**
 * Read from stream and returns it as one big string
 * @param stream
 */
function readString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (data) => chunks.push(data));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}
exports.readString = readString;
/**
 * Send https GET method to a specified resource on the API server
 * @param apikey API key credential used to access a resource
 * @param resource Path to a resorce
 * @param query Query parameter object
 */
function httpsGet(clientSetting, resource, query) {
    return new Promise((resolve) => {
        const stringQuery = querystring_1.default.stringify(query);
        https_1.default.get(`${constants_1.URL_API}/${resource}?${stringQuery}`, {
            headers: {
                Authorization: `Bearer ${clientSetting.apikey}`,
                "Accept-Encoding": 'gzip'
            },
            timeout: clientSetting.timeout,
        }, (res) => resolve(res));
    });
}
exports.httpsGet = httpsGet;
