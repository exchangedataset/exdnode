import { ClientImpl, setupClientSetting } from './impl';
import { HTTPModule } from '../http/http';
import { RawRequest, RawRequestParam } from '../raw/raw';
import { ReplayRequest, ReplayRequestParam } from '../replay/replay';

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
 * User can interact with API using a client
 */
export interface Client {
  /**
   * Low-level http call module.
   */
  http: HTTPModule;
  /**
   * Lower-level API that processes data from Exchangedataset HTTP-API and
   * generate raw (close to exchanges' format) data.
   */
  raw(param: RawRequestParam): RawRequest;
  /**
   * Returns builder to create {@link ReplayRequest} that replays market data.
   */
  replay(param: ReplayRequestParam): ReplayRequest;
}

/**
 * Creates new Client class instance and returns it.
 * @param config Config to be used in the client instance.
 * @returns Created client with config specified with `config` parameter.
 * @see ClientParam
 */
export function createClient(config: ClientParam): Client {
  const setting = setupClientSetting(config);
  return new ClientImpl(setting);
}
