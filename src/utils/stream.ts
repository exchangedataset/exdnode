import https from 'https';
import querystring, { ParsedUrlQueryInput } from 'querystring';
import { IncomingMessage } from 'http';

import { URL_API } from '../variables';
import { ClientSetting } from '../client';

/**
 * Read from stream and returns it as one big string
 * @param stream
 */
export function readString(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (data) => chunks.push(data));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

/**
 * Send https GET method to a specified resource on the API server
 * @param apikey API key credential used to access a resource
 * @param resource Path to a resorce
 * @param query Query parameter object
 */
export function httpsGet(
  clientSetting: ClientSetting,
  resource: string,
  query: ParsedUrlQueryInput,
):Promise<IncomingMessage> {
  return new Promise((resolve) => {
    const stringQuery = querystring.stringify(query);
    https.get(URL_API, {
      headers: { Authorization: `Bearer ${clientSetting.apikey}` },
      path: `${resource}?${stringQuery}`,
      timeout: clientSetting.timeout,
    }, (res) => resolve(res));
  });
}
