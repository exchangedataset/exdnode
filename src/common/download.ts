/**
 * @internal
 * @packageDocumentation
 */

import stream from "stream"

import { httpsGet, readString } from "../utils/stream";
import { ClientSetting } from "../client/impl";
import { ParsedUrlQueryInput } from "querystring";
import { createGunzip } from "zlib";

export async function getResponse(
  clientSetting: ClientSetting,
  resource: string,
  query: ParsedUrlQueryInput,
): Promise<{
  statusCode: number;
  stream: stream.Readable;
}> {
  // request and download
  const res = await httpsGet(
    clientSetting,
    resource,
    query,
  );

  /* check status code and content-type header */
  const { statusCode, headers } = res;
  if (typeof statusCode === 'undefined') {
    throw new Error("status code is undefined")
  }
  // 200 = ok, 404 = database not found
  if (statusCode !== 200 && statusCode !== 404) {
    const msg = await readString(res);
    let error: Error | string;
    try {
      const obj = JSON.parse(msg);
      error = obj.error || obj.message || obj.Message;
    } catch (e) {
      error = msg;
    }
    throw new Error(`${resource}: Request failed: ${statusCode} ${error}\nPlease check the internet connection and the remaining quota of your API key`);
  }
  // check content type
  const contentType = headers['content-type'];
  if (contentType !== 'text/plain') {
    throw new Error(`Invalid response content-type, expected: 'text/plain' got: '${contentType}'`);
  }
  // check for compression
  if ('content-encoding' in headers) {
    // looks like response is compressed
    const contentEncoding = headers['content-encoding'];

    // only gzip is supported
    if (contentEncoding !== 'gzip') {
      throw new Error(`found '${contentEncoding}' in Content-Encoding header, but it is not supported`)
    }
    const gunzip = createGunzip()
    gunzip.setEncoding("utf-8");
    return {statusCode, stream: res.pipe(gunzip)}
  }

  return {statusCode, stream: res};
}