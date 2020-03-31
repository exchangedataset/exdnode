/**
 * @internal
 * @packageDocumentation
 */

import moment from 'moment';

export type AnyDateInstance = string | Date | number | moment.Moment | bigint;

export function convertNanosecToMinute(nanosec: bigint): number {
  return Number.parseInt((nanosec / BigInt('60') / BigInt('1000000000')).toString(), 10);
}

export function convertDatetimeParam(datetime: AnyDateInstance): bigint {
  if (typeof datetime === 'bigint') {
    // already in target type
    return datetime;
  }
  let tmp = datetime;
  let unixtime;
  if (typeof tmp === 'string') {
    // convert string to date, it will later be converted into minutes from utc
    tmp = new Date(tmp);
  }
  if (tmp instanceof Date) {
    unixtime = tmp.getTime();
  } else if (typeof tmp === 'number') {
    // minute in integer form
    if (!Number.isInteger(tmp)) throw TypeError('Parameter "datetime" as minutes must be an integer');
    unixtime = tmp * 60;
  } else if ('unix' in tmp) {
    // must be moment.Moment
    unixtime = tmp.unix();
  } else {
    throw new Error('Object supplied is not supported as date-like object');
  }
  return BigInt(unixtime) * BigInt('1000000000');
}
