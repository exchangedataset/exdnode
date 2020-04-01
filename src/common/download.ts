/**
 * @internal
 * @packageDocumentation
 */

import { httpsGet, readString } from "../utils/stream";
import { ClientSetting } from "../client/impl";
import { ParsedUrlQueryInput } from "querystring";
import { IncomingMessage } from "http";

export async function getResponse(
  clientSetting: ClientSetting,
  resource: string,
  query: ParsedUrlQueryInput,
): Promise<IncomingMessage> {
  // request and download
  const res = await httpsGet(
    clientSetting,
    resource,
    query,
  );

  /* check status code and content-type header */
  const { statusCode, headers } = res;
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
    throw new Error(`Request failed: ${statusCode} ${error}\nPlease check the internet connection and the remaining quota of your API key`);
  }
  // check content type
  const contentType = headers['content-type'];
  if (contentType !== 'text/plain') {
    throw new Error(`Invalid response content-type, expected: 'text/plain' got: '${contentType}'`);
  }

  return res;
}