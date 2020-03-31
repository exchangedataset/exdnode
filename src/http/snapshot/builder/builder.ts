import { AnyDateInstance } from "../../../utils/datetime";
import { SnapshotRequest } from "../request";

/**
 * Builds {@link SnapshotRequest}.
 */
export interface SnapshotRequestBuilder {
  /**
   * Adds what topics of Bitmex exchange to take a snapshot.
   * 
   * Topics can be manually provided, or can be picked using builder created
   * by calling {@link filterBitmex}.
   * The latter is more 'healthy' way of providing parameters to this function
   * since by using builder you can eliminate the possibility of typos.
   * 
   * @param topics Array of topics to take a snapshot
   */
  bitmex(topics: string[]): SnapshotRequestBuilder;
  /**
   * Adds what topics of Bitmex exchange to take a snapshot.
   * 
   * Topics can be manually provided, or can be picked using builder created
   * by calling {@link filterBitmex}.
   * The latter is more 'healthy' way of providing parameters to this function
   * since by using builder you can eliminate the possibility of typos.
   * 
   * @param topics Array of topics to take a snapshot
   */
  bitfinex(topics: string[]): SnapshotRequestBuilder;
  /**
   * Adds what topics of Bitflyer exchange to take a snapshot.
   * 
   * Topics can be manually provided, or can be picked using builder created
   * by calling {@link filterBitflyer}.
   * The latter is more 'healthy' way of providing parameters to this function
   * since by using builder you can eliminate the possibility of typos.
   * 
   * @param topics Array of topics to take a snapshot
   */
  bitflyer(topics: string[]): SnapshotRequestBuilder;
  /**
   * Adds topics of arbitrary exchange.
   * 
   * Note that exchanges does not included as function might not be supported by Exchangedataset.
   * @param channels Array of channels to filter-in
   */
  exchange(exchange: string, topics: string[]): SnapshotRequestBuilder;
  /**
   * Set the date time to take snapshot at.
   * @param date Various date like instance
   */
  at(datetime: AnyDateInstance): SnapshotRequestBuilder;
  /**
   * Build this and get `SnapshotRequest`.
   * You will get result in raw format that the exchanges are providing with.
   */
  asRaw(): SnapshotRequest;
  /**
   * Build this and get `SnapshotRequest`.
   * You will get result formatted in csv-like structure.
   */
  asCSVLike(): SnapshotRequest;
}

export * from './bitmex';
export * from './bitflyer';
export * from './bitfinex';
