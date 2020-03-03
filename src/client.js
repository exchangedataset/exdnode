import urlsafeBase64 from 'urlsafe-base64';

const convertNanosecToMinute = (nanosec) => nanosec / BigInt(60) / BigInt(1000000000);

export default class Client {
  constructor(clientSetting) {
    const { apikey } = clientSetting;

    if (typeof apikey !== 'string') throw new TypeError('An API key must be of string type');
    if (!urlsafeBase64.validate(apikey)) throw new TypeError('An API key provided is not in a url-safe base64 format');
    this.apikey = apikey;
  }

  async filter(exchange, start, end, channels) {
    /* convert date into utc nanosec (extends unixtime) */
    startNanosec = convertDatetimeParam(start);
    endNanosec = convertDatetimeParam(end);
  
    const shard = await getShard(this.apikey, exchange, start);
    // reader.on('line', (line) => {
    //   console.log('line', line);
    // });
    // reader.on('close', () => {

    // });
    return shard;
  };
}
