"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function encodeBase64(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
exports.encodeBase64 = encodeBase64;
function decodeBase64(encoded) {
    const str = Array(5 - (encoded.length % 4)).join('=')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    return Buffer.from(str, 'base64');
}
exports.decodeBase64 = decodeBase64;
function validateBase64(str) {
    return /^[A-Za-z0-9\-_]+$/.test(str);
}
exports.validateBase64 = validateBase64;
