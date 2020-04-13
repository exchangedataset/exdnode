"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
const impl_2 = require("../raw/impl");
const common_1 = require("./common");
class ReplayStreamIterator {
    constructor(clientSetting, setting) {
        this.clientSetting = clientSetting;
        this.setting = setting;
        this.defs = {};
        this.postFilter = {};
        const req = new impl_2.RawRequestImpl(this.clientSetting, {
            filter: impl_1.convertReplayFilterToRawFilter(this.setting.filter),
            start: this.setting.start,
            end: this.setting.end,
            format: "json",
        });
        this.rawItr = req.stream()[Symbol.asyncIterator]();
        // it needs to post filter
        for (const [exchange, channels] of Object.entries(setting.filter)) {
            this.postFilter[exchange] = new Set();
            for (const channel of channels) {
                this.postFilter[exchange].add(channel);
            }
        }
    }
    async next() {
        while (true) {
            const nx = await this.rawItr.next();
            if (nx.done) {
                return {
                    done: true,
                    value: null,
                };
            }
            const line = nx.value;
            const processed = common_1.processRawLines(this.defs, line);
            if (processed === null) {
                continue;
            }
            if (this.postFilter[processed.exchange].has(processed.channel)) {
                return {
                    done: false,
                    value: processed,
                };
            }
        }
    }
}
exports.ReplayStreamIterator = ReplayStreamIterator;