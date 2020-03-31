"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("../../client/impl");
const impl_2 = require("./impl");
const request_impl_1 = require("./request.impl");
/**
 * Enum of Line Type.
 *
 * Line Type shows what type of a line it is, such as message line or start line.
 * Lines with different types contain different information and have to be treated differently.
 *
 * @see FilterLine
 */
var LineType;
(function (LineType) {
    /**
     * Message Line Type.
     *
     * This is the most usual Line Type.
     */
    LineType["MESSAGE"] = "msg";
    /**
     * Send Line Type.
     *
     * Message send from one of our client when recording.
     */
    LineType["SEND"] = "send";
    /**
     * Start Line Type.
     *
     * Indicates the first line in the continuous recording.
     */
    LineType["START"] = "start";
    /**
     * End Line Type.
     *
     * Indicates the end line in the continuous recording.
     */
    LineType["END"] = "end";
    /**
     * Error Line Type.
     *
     * Used when error occurrs on recording.
     * Used in both server-side error and client-side error.
     */
    LineType["ERROR"] = "err";
})(LineType = exports.LineType || (exports.LineType = {}));
/**
 * Returns {@link FilterRequest} for given client and filter parameter.
 * @param clientParams Client parameter
 * @param params Filter parameter
 */
function filter(clientParams, params) {
    return new request_impl_1.FilterRequestImpl(impl_1.setupSetting(clientParams), impl_2.setupSetting(params));
}
exports.filter = filter;
__export(require("./request"));