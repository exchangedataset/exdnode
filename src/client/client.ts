import { FilterRequest, FilterParam } from '../filter/filter';
import { ClientImpl, setupSetting } from './impl';

/**
 * Settings for client.
 */
export type ClientParam = {
  /**
   * API key used to access Exchangedataset API server.
   */
  apikey: string;
  /**
   * Connection timeout in millisecond.
   */
  timeout?: number;
}

/**
 * By using Client, you don't have to provide {@link ClientParam} for every API call.
 */
export interface Client {
  filter(params: FilterParam): FilterRequest;
}

/**
 * Create new Client class instance and returns it.
 *
 * This is identical to `new Client(ClientParam)`.
 *
 * @param params Setting to be used in the client instance.
 * @returns Created client with setting specified with `setting` parameter.
 * @see ClientParam
 */
export function createClient(params: ClientParam): Client {
  const setting = setupSetting(params);
  return new ClientImpl(setting);
}
