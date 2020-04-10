"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./filter/impl");
const impl_2 = require("./snapshot/impl");
class HTTPModuleImpl {
    constructor(clientSetting) {
        this.clientSetting = clientSetting;
    }
    async filter(param) {
        if (typeof param === 'undefined')
            throw new Error("'param' must be specified");
        const setting = impl_1.setupFilterRequestSetting(param);
        return await impl_1.filterDownload(this.clientSetting, setting);
    }
    async snapshot(param) {
        if (typeof param === 'undefined')
            throw new Error("'param' must be specified");
        return await impl_2.snapshotDownload(this.clientSetting, impl_2.setupSnapshotRequestSetting(param));
    }
}
exports.HTTPModuleImpl = HTTPModuleImpl;
