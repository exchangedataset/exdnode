"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const client_1 = __importDefault(require("./client"));
const convertDatetimeParam = (datetime) => {
    if (typeof datetime === 'string') {
    }
    else if (datetime instanceof Date) {
    }
    else if (datetime instanceof Number) {
    }
    else if (datetime instanceof moment_1.default.Moment) {
    }
    else {
        throw new TypeError('Unsupported datetime object');
    }
};
exports.default = {
    createClient: (apikey) => new client_1.default(apikey),
};
