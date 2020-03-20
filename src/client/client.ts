import { ClientImpl, setupSetting } from './impl';
import FilterRequestBuilder from '../filter/request/builder';

/**
 * Config for making new client.
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
 * Client eliminates the neccesity of providing {@link ClientParam} for every API call.
 */
export interface Client {
  filter(): FilterRequestBuilder;
}

/**
 * Creates new Client class instance and returns it.
 * @param config Config to be used in the client instance.
 * @returns Created client with config specified with `config` parameter.
 * @see ClientParam
 */
export function createClient(config: ClientParam): Client {
  const setting = setupSetting(config);
  return new ClientImpl(setting);
}
