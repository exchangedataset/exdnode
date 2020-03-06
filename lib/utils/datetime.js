"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function convertNanosecToMinute(nanosec) {
    return Number.parseInt((nanosec / BigInt(60) / BigInt(1000000000)).toString());
}
exports.convertNanosecToMinute = convertNanosecToMinute;
function convertDatetimeParam(datetime) {
    if (typeof datetime === 'string') {
        // convert string to date, it will later be converted into minutes from utc
        datetime = new Date(datetime);
    }
    if (datetime instanceof Date) {
        return Math.floor(datetime.getTime() / 1000 / 60);
    }
    else if (typeof datetime === 'number') {
        // minute in integer form
        if (!Number.isInteger(datetime))
            throw TypeError('Parameter "datetime" as minutes must be an integer');
        return datetime;
    }
    else {
        // must be moment.Moment
        return Math.floor(datetime.unix() / 60);
    }
}
exports.convertDatetimeParam = convertDatetimeParam;
;
