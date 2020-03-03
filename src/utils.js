import https from 'https';
import querystring from 'querystring';
import readline from 'readline';
import { Stream } from 'stream';

import { URL_API } from './variables';

/**
 * Read from stream and returns it as one big string
 * @param {Stream} stream
 */
export const readString = (stream) => new Promise((resolve, reject) => {
  const chunks = [];
  stream.on('data', (data) => chunks.push(data));
  stream.on('error', reject);
  stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
});

/**
 * Read line by line from a stream as a plain text and return an array of them in the order
 * @param {Stream} stream
 */
export const readLines = (stream) => {
  if (!(stream instanceof Stream)) throw new TypeError('An parameter "stream" must extend Stream class');
  return new Promise((resolve, reject) => {
    const lineStream = readline.createInterface({
      input: stream,
    });
    const lineArr = [];
    lineStream.on('line', (line) => lineArr.push(line));
    lineStream.on('error', (error) => reject(error));
    lineStream.on('end', () => resolve(lineArr));
  });
};

/**
 * Send https GET method to a specified resource on the API server
 * @param {string} apikey API key credential used to access a resource
 * @param {string} resource Path to a resorce
 * @param {object} query Query parameter object
 */
export const httpsGet = (apikey, resource, query) => new Promise((resolve) => {
  const stringQuery = querystring.stringify(query);
  https.get(URL_API, {
    headers: { Authorization: `Bearer ${apikey}` },
    path: `${resource}?${stringQuery}`,
  }, (res) => resolve(res));
});