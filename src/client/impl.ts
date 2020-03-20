/**
 * @internal
 * @packageDocumentation
 */

import { validateBase64 } from '../utils/base64';
import { CLIENT_DEFAULT_TIMEOUT } from '../constants';
import { ClientParam, Client } from './client';
import { FilterRequestBuilderImpl } from '../filter/request/builder.impl';
import { FilterRequestBuilder } from '../filter/request/builder';

export type ClientSetting = {
  apikey: string;
  timeout: number;
}

export function setupSetting(reference: ClientParam): ClientSetting {
  // take a shallow copy of reference setting as this will be modified
  if (!validateBase64(reference.apikey)) throw new TypeError('Setting "apikey" must be an valid url-safe base64 value');
  let timeout: number;
  if (typeof reference.timeout === 'undefined') {
    // set default timeout value if it was not set
    timeout = CLIENT_DEFAULT_TIMEOUT;
  } else if (!Number.isInteger(reference.timeout)) {
    throw new TypeError('Setting "timeout" must be an integer value');
  } else {
    timeout = reference.timeout;
  }

  return { apikey: reference.apikey, timeout };
}

export class ClientImpl implements Client {
  constructor(private setting: ClientSetting) {}

  filter(): FilterRequestBuilder {
    return new FilterRequestBuilderImpl(this.setting);
  }
}
