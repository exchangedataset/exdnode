"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
function encodeBase64(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
exports.encodeBase64 = encodeBase64;
function decodeBase64(encoded) {
    const normal = encoded + Array(5 - (encoded.length % 4)).fill('=');
    const base64 = normal
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    return Buffer.from(base64, 'base64');
}
exports.decodeBase64 = decodeBase64;
function validateBase64(str) {
    return /^[A-Za-z0-9\-_]+$/.test(str);
}
exports.validateBase64 = validateBase64;
