import moment from 'moment';
import Client from './client';

const convertDatetimeParam = (datetime) => {
  if (typeof datetime === 'string') {

  } else if (datetime instanceof Date) {

  } else if (datetime instanceof Number) {

  } else if (datetime instanceof moment.Moment) {
    
  } else {
    throw new TypeError('Unsupported datetime object');
  }
};

export default {
  createClient: (apikey) => new Client(apikey),
};
