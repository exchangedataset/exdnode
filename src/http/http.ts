import { FilterParam } from './filter/filter';
import { SnapshotParam, Snapshot } from './snapshot/snapshot';
import { Shard } from '../common/line';

/**
 * Low-level HTTP-API module.
 */
export interface HTTPModule {
  /**
   * Create and return request to filter method HTTP-API endpoint.
   */
  filter(param: FilterParam): Promise<Shard>;
  /**
   * Create and return request to snapshot method HTTP-API endpoint.
   */
  snapshot(param: SnapshotParam): Promise<Snapshot[]>;
}

export * as filter from './filter/filter';
export * as snapshot from './snapshot/snapshot';
