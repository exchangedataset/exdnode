import { Filter } from '../common/param';
import { AnyDateInstance } from '../utils/datetime';

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

export * from './builder/builder';
