"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
const impl_2 = require("../client/impl");
/**
 * Enum of line type.
 *
 * Line type shows what type of a line it is, such as message line or start line.
 * Lines with different types contain different information and have to be treated differently.
 *
 * @see FilterLine
 */
var LineType;
(function (LineType) {
    LineType["MESSAGE"] = "msg";
    LineType["SEND"] = "send";
    LineType["START"] = "start";
    LineType["END"] = "end";
    LineType["ERROR"] = "err";
})(LineType = exports.LineType || (exports.LineType = {}));
function filter(clientParams, params) {
    return new impl_1.FilterRequestImpl(impl_2.setupSetting(clientParams), impl_1.setupSetting(params));
}
exports.filter = filter;
