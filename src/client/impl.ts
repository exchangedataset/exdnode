/**
 * @internal
 * @packageDocumentation
 */

import { validateBase64 } from '../utils/base64';
import { CLIENT_DEFAULT_TIMEOUT } from '../constants';
import { ClientParam, Client } from './client';
import { HTTPModule } from '../http/http';
import { HTTPModuleImpl } from '../http/impl';
import { RawRequestParam, RawRequest } from '../raw/raw';
import { RawRequestImpl, setupRawRequestSetting } from '../raw/impl';
import { ReplayRequest, ReplayRequestParam } from '../replay/replay';
import { ReplayRequestImpl, setupReplayRequestSetting } from '../replay/impl';

export type ClientSetting = {
  apikey: string;
  timeout: number;
}

export function setupClientSetting(reference: ClientParam): ClientSetting {
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
  public http: HTTPModule;

  constructor(private setting: ClientSetting) {
    this.http = new HTTPModuleImpl(setting);
  }

  raw(param: RawRequestParam): RawRequest {
    return new RawRequestImpl(this.setting, setupRawRequestSetting(param));
  }
  replay(param: ReplayRequestParam): ReplayRequest {
    return new ReplayRequestImpl(this.setting, setupReplayRequestSetting(param));
  }
}
