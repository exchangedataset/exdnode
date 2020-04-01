import { Filter } from '../common/param';
import { AnyDateInstance } from '../utils/datetime';
import { Line } from '../common/line';
import { ClientParam } from '../client/client';
import { setupClientSetting } from '../client/impl';
import { ReplayRequestImpl, setupReplayRequestSetting } from './impl';

/**
 * Parameters neccesary to send request to API server.
 */
export type ReplayRequestParam = {
  /**
   * What exchanges and channels to filter-in.
   */
  filter: Filter;
  /**
   * Start date-time.
   */
  start: AnyDateInstance;
  /**
   * End date-time.
   */
  end: AnyDateInstance;
}

export interface ReplayRequest {
  download(): Promise<Line[]>;
  stream(): AsyncIterable<Line>;
}

export function replay(clientParam: ClientParam, param: ReplayRequestParam): ReplayRequest {
  return new ReplayRequestImpl(setupClientSetting(clientParam), setupReplayRequestSetting(param));
}

export * from './builder/builder';
