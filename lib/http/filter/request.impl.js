"use strict";
/**
 * @internal
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const download_1 = __importDefault(require("./download"));
const iterator_1 = __importDefault(require("./stream/iterator"));
class FilterRequestImpl {
    constructor(clientSetting, setting) {
        this.clientSetting = clientSetting;
        this.setting = setting;
    }
    async download() {
        return download_1.default(this.clientSetting, this.setting);
    }
    stream(bufferSize) {
        const clientSetting = this.clientSetting;
        const setting = this.setting;
        return {
            [Symbol.asyncIterator]() {
                return new iterator_1.default(clientSetting, setting, bufferSize);
            },
        };
    }
}
exports.FilterRequestImpl = FilterRequestImpl;
