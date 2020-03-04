import moment from 'moment';

export function convertDatetimeParam(datetime: string | Date | number | moment.Moment): number {
  if (typeof datetime === 'string') {
    // convert string to date, it will later be converted into minutes from utc
    datetime = new Date(datetime);
  }
  if (datetime instanceof Date) {
    return Math.floor(datetime.getTime() / 1000 / 60)
  } else if (typeof datetime === 'number') {
    // minute in integer form
    if (!Number.isInteger(datetime)) throw TypeError('Parameter "datetime" as minutes must be an integer');
    return datetime;
  } else {
    // must be moment.Moment
    return Math.floor(datetime.unix() / 60);
  }
};
