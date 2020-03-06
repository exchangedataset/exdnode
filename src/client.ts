import { validateBase64 } from "./utils/base64";
import { FilterRequest, FilterStreamImpl } from "./filter/filter";
import { CLIENT_DEFAULT_TIMEOUT } from "./variables";

/**
 * Settings for client.
 */
export type ClientSettingParam = {
  /**
   * API key used to access Exchangedataset API server.
   */
  apikey: string,
  /**
   * Connection timeout in millisecond.
   */
  timeout?: number,
}

export type ClientSetting = {
  apikey: string,
  timeout: number,
}

function setupSetting(reference: ClientSettingParam): ClientSetting {
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

export class Client {
  private setting: ClientSetting;

  constructor(setting: ClientSettingParam) {
    this.setting = setupSetting(setting);
  }

  async filter(exchange: string, start: bigint, end: bigint, channels: string[]): Promise<FilterRequest> {
    /* convert date into utc nanosec (extends unixtime) */
    const startNanosec = convertDatetimeParam(start);
    const endNanosec = convertDatetimeParam(end);
  
    const shard = await filter(this.apikey, exchange, start);
    // reader.on('line', (line) => {
    //   console.log('line', line);
    // });
    // reader.on('close', () => {

    // });
    return new FilterStreamImpl(this.setting, exchange, start, end, channels);
  };
}

/**
 * Create new Client class instance and returns it.
 *
 * This is identical to `new Client(ClientSetting)`.
 * {@link ClientSetting}
 * @param setting Setting to be used in the client instance.
 * @returns Created client with setting specified with `setting` parameter.
 */
export function createClient(setting: ClientSetting): Client {
  return new Client(setting);
}