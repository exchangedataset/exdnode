"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    LineType[LineType["MESSAGE"] = 1] = "MESSAGE";
    LineType[LineType["SEND"] = 2] = "SEND";
    LineType[LineType["START"] = 3] = "START";
    LineType[LineType["END"] = 4] = "END";
    LineType[LineType["ERROR"] = 5] = "ERROR";
})(LineType = exports.LineType || (exports.LineType = {}));
