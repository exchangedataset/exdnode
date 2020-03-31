"use strict";
/**
 * @internal
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
class SnapshotRequestImpl {
    constructor(clientSetting, setting) {
        this.clientSetting = clientSetting;
        this.setting = setting;
    }
    async download() {
        throw new Error("Method not implemented.");
    }
}
exports.SnapshotRequestImpl = SnapshotRequestImpl;
