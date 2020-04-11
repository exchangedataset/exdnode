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
        const req = new impl_2.RawRequestImpl(this.clientSetting, {
            filter: impl_1.convertReplayFilterToRawFilter(this.setting.filter),
            start: this.setting.start,
            end: this.setting.end,
            format: "json",
        });
        this.rawItr = req.stream()[Symbol.asyncIterator]();
    }
    async next() {
        const nx = await this.rawItr.next();
        if (nx.done) {
            return {
                done: true,
                value: null,
            };
        }
        const line = nx.value;
        const exchange = line.exchange;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const channel = line.channel;
        if (!(exchange in this.defs)) {
            // this is the first line for this exchange
            this.defs[exchange] = {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [channel]: JSON.parse(line.message)
            };
        }
        if (!(channel in this.defs[exchange])) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.defs[exchange][channel] = JSON.parse(line.message);
        }
        const processed = common_1.processRawLines(this.defs[exchange][channel], line);
        return {
            done: false,
            value: processed,
        };
    }
}
exports.ReplayStreamIterator = ReplayStreamIterator;
