import { FilterRequest } from './request';
import { FilterParam } from '../filter';
import { AnyDateInstance } from '../../utils/datetime';

/**
 * Builds `FilterRequest`.
 * 
 * You must provide builder with
 * - Exchanges and its channels to filter-in by calling functions with exchange name
 *  or by calling {@link exchange} function to select arbitrary exchanges and channels.
 * - Time range by functions `start` and `end` or `range` to set them both at the time.
 * - What data format to fetch.
 * 
 * Get `FilterRequest` by specifing the data format either by calling
 * - {@link asRaw()} to get results in a raw format which format is specific to each exchange
 * - {@link asFormatted()} to get results in a formatted version
 * Or, you can get `FilterRequest` by {@link configure()} providing config by {@link FilterParam} object.
 */
export default interface FilterRequestBuilder {
  /**
   * Adds what channels of Bitmex exchange to filter-in.
   * 
   * Channels can be manually provided, or can be picked using builder created
   * by calling {@link filterBitmex}.
   * The latter is more 'healthy' way of providing parameters to this function
   * since by using builder you can eliminate the possibility of typos.
   * 
   * @param channels Array of channels to filter-in
   */
  bitmex(channels: string[]): FilterRequestBuilder;
  /**
   * Adds what channels of Bitflyer exchange to filter-in.
   * 
   * Channels can be manually provided, or can be picked using builder created
   * by calling {@link filterBitflyer}.
   * The latter is more 'healthy' way of providing parameters to this function
   * since by using builder you can eliminate the possibility of typos.
   * 
   * @param channels Array of channels to filter-in
   */
  bitflyer(channels: string[]): FilterRequestBuilder;
  /**
   * Adds what channels of Bitflyer exchange to filter-in.
   * 
   * Channels can be manually provided, or can be picked using builder created
   * by calling {@link filterFinex}.
   * The latter is more 'healthy' way of providing parameters to this function
   * since by using builder you can eliminate the possibility of typos.
   * 
   * @param channels Array of channels to filter-in
   */
  bitfinex(channels: string[]): FilterRequestBuilder;
  /**
   * Adds filter of channels of arbitrary exchange.
   * 
   * Note that exchanges does not included as function might not be supported by Exchangedataset.
   * @param channels Array of channels to filter-in
   */
  exchange(exchangeName: string, channels: string[]): FilterRequestBuilder;
  /**
   * Set the start date and time of filtering.
   * 
   * @param date Various date like instance
   * @see AnyDateInstance
   */
  start(date: AnyDateInstance): FilterRequestBuilder;
  /**
   * Set the end date and time of filtering.
   * 
   * If only date was given, it will be comprehended as the very end of the day.
   * 
   * Example: `2020-03-20` is the same as `2020-03-21 00:00:00`
   * 
   * Beware that the end date time is exclusive, means `2020-03-20 08:17:00` is not included but
   * `2020-03-20 08:16:59.999999999` is.
   * @param date Various date like instance
   */
  end(date: AnyDateInstance): FilterRequestBuilder;
  /**
   * Set the start and end date and time of filtering.
   * 
   * @param start Various date like instance
   * @param end Various date like instance
   * @see start
   * @see end
   * @see AnyDateInstance
   */
  range(start: AnyDateInstance, end: AnyDateInstance): FilterRequestBuilder;
  /**
   * Build this and get `FilterRequest`.
   * You will get result in raw format that the exchanges are providing with.
   */
  asRaw(): FilterRequest;
  /**
   * Build this and get `FilterRequest`.
   * You will get result formatted in csv-like structure.
   */
  asFormatted(): FilterRequest;
  /**
   * Bypass builder with complete {@link FilterParam} object to set.
   */
  configure(params: FilterParam): FilterRequest;
}

export * from './builder/bitmex';
export * from './builder/bitflyer';
export * from './builder/bitfinex';
