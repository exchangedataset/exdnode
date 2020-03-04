"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const querystring_1 = __importDefault(require("querystring"));
const variables_1 = require("./variables");
function urlsafeBase64Encode(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
exports.urlsafeBase64Encode = urlsafeBase64Encode;
exports.urlsafeBase64Decode = (encoded) => {
    const str = Array(5 - (encoded.length % 4)).join('=')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    return Buffer.from(str, 'base64');
};
exports.urlsafeBase64Validate = (str) => /^[A-Za-z0-9\-_]+$/.test(str);
/**
 * Read from stream and returns it as one big string
 * @param stream
 */
exports.readString = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (data) => chunks.push(data));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
});
/**
 * Send https GET method to a specified resource on the API server
 * @param apikey API key credential used to access a resource
 * @param resource Path to a resorce
 * @param query Query parameter object
 */
function httpsGet(apikey, resource, query) {
    return new Promise((resolve) => {
        const stringQuery = querystring_1.default.stringify(query);
        https_1.default.get(variables_1.URL_API, {
            headers: { Authorization: `Bearer ${apikey}` },
            path: `${resource}?${stringQuery}`,
        }, (res) => resolve(res));
    });
}
exports.httpsGet = httpsGet;
