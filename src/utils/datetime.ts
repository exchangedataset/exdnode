/**
 * @internal
 * @packageDocumentation
 */

import moment from 'moment';

export type AnyDateTime = string | Date | number | moment.Moment | bigint;

export type AnyMinute = string | Date | number | moment.Moment;

export function convertNanosecToMinute(nanosec: bigint): number {
  return Number.parseInt((nanosec / BigInt('60') / BigInt('1000000000')).toString(), 10);
}

export function convertAnyDateTime(datetime: AnyDateTime): bigint {
  if (typeof datetime === 'bigint') {
    // already in target type
    return datetime;
  }
  let tmp = datetime;
  if (typeof tmp === 'string') {
    // convert string to date, it will later be converted into minutes from utc
    tmp = new Date(tmp);
  }
  if (tmp instanceof Date) {
    return BigInt(tmp.getTime()) * BigInt('1000000');
  }
  
  let unixtime;
  if (typeof tmp === 'number') {
    // minute in integer form
    if (!Number.isInteger(tmp)) throw TypeError('An integer must be passed as an AnyDatetime');
    unixtime = tmp * 60;
  } else if ('unix' in tmp) {
    // must be moment.Moment
    unixtime = tmp.unix();
  } else {
    throw new Error('An object supplied is not supported as date-like object');
  }
  return BigInt(unixtime) * BigInt('1000000000');
}

export function convertAnyMinute(minute: AnyMinute): number {
  if (typeof minute === 'number') {
    if (!Number.isInteger(minute)) {
      throw new Error('An integer must be passed as an AnyMinute');
    }
    return minute;
  }
  let tmp = minute;
  if (typeof tmp === 'string') {
    tmp = new Date(tmp);
  }
  let unixtime;
  if (tmp instanceof Date) {
    unixtime = tmp.getTime() / 1000;
  } else if ('unix' in tmp) {
    // must be moment.Moment
    unixtime = tmp.unix();
  } else {
    throw new Error('An object supplied is not supported as minute object');
  }
  return Math.floor(unixtime / 60);
}
