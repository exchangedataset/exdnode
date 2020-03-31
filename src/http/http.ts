import { SnapshotRequestBuilder } from './snapshot/builder/builder';
import { FilterRequestBuilder } from './filter/filter';

/**
 * Low-level HTTP-API module.
 */
export interface HTTPModule {
  /**
   * Create and return builder to call filter method of HTTP-API.
   */
  filter(): FilterRequestBuilder;
  /**
   * Create and return builder to call snapshot method of HTTP-API.
   */
  snapshot(): SnapshotRequestBuilder;
}

export * as filter from './filter/filter';
export * as snapshot from './snapshot/snapshot';
