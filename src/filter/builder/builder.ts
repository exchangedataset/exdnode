import { FilterBuilderImpl } from './impl';
import { Filter } from '../filter';

/**
 * FilterBuilder builds a filter object in {@link FilterParam} more intuitively.
 */
export interface FilterBuilder {
  bitmex(channels: string[]): FilterBuilder;
  bitflyer(channels: string[]): FilterBuilder;
  bitfinex(channels: string[]): FilterBuilder;
  exchange(exchangeName: string, channels: string[]): FilterBuilder;
  build(): Filter;
}

export function filterBuilder(): FilterBuilder {
  return new FilterBuilderImpl();
}

export * from './bitmex';
export * from './bitflyer';
export * from './bitfinex';
