import { AnyDateInstance } from '../../utils/datetime';
import { ReplayRequestParam } from '../replay';

/**
 * Builds {@link ReplayRequestParam}.
 * 
 * You must provide builder with
 * - Exchanges and its channels to filter-in by calling functions with exchange name
 *  or by calling {@link exchange} function to select arbitrary exchanges and channels.
 * - Time range by functions `start` and `end` or `range` to set them both at the time.
 * - What data format to fetch.
 * 
 * Get {@link ReplayRequestParam} by specifing the data format either by calling
 * - {@link asRaw()} to get results in a raw format which format is specific to each exchange
 * - {@link asCSVLike()} to get results in a csv-like formatted version
 */
export interface ReplayRequestParamBuilder {
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
  bitmex(channels: string[]): ReplayRequestParamBuilder;
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
  bitflyer(channels: string[]): ReplayRequestParamBuilder;
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
  bitfinex(channels: string[]): ReplayRequestParamBuilder;
  /**
   * Adds filter of channels of arbitrary exchange.
   * 
   * Note that exchanges does not included as function might not be supported by Exchangedataset.
   * @param channels Array of channels to filter-in
   */
  exchange(exchangeName: string, channels: string[]): ReplayRequestParamBuilder;
  /**
   * Set the start date-time of filtering.
   * 
   * @param date Various date like instance
   * @see AnyDateInstance
   */
  start(date: AnyDateInstance): ReplayRequestParamBuilder;
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
  end(date: AnyDateInstance): ReplayRequestParamBuilder;
  /**
   * Set the start and end date and time of filtering.
   * 
   * @param start Various date like instance
   * @param end Various date like instance, if not provided, `start` will be used.
   * @see start
   * @see end
   * @see AnyDateInstance
   */
  range(start: AnyDateInstance, end?: AnyDateInstance): ReplayRequestParamBuilder;
  /**
   * Build this and get {@link ReplayRequestParam}.
   */
  build(): ReplayRequestParam;
}

export * from './bitmex';
export * from './bitflyer';
export * from './bitfinex';
