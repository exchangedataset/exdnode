import { FilterParam, FilterRequest } from './filter/filter';
import { SnapshotParam, SnapshotRequest } from './snapshot/snapshot';

/**
 * Low-level HTTP-API module.
 */
export interface HTTPModule {
  /**
   * Create and return request to filter method HTTP-API endpoint.
   */
  filter(param: FilterParam): FilterRequest;
  /**
   * Create and return request to snapshot method HTTP-API endpoint.
   */
  snapshot(param: SnapshotParam): SnapshotRequest;
}

export * as filter from './filter/filter';
export * as snapshot from './snapshot/snapshot';
