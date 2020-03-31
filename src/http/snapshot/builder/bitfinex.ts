import { SNAPSHOT_TOPIC_SUBSCRIBED } from "../../../constants";

export interface SnapshotBitfinexChannelsBuilder {
  /**
   * Subscribed message of specified channels.
   * @param chs Channels to take snapshot of subscribed message
   */
  subscribed(chs: string[]): SnapshotBitfinexChannelsBuilder;
  /**
   * Orderbook of specified pairs.
   * @param pairs Pairs to take orderbook snapshot
   */
  book(pairs: string[]): SnapshotBitfinexChannelsBuilder;
  /**
   * Add an arbitrary topics.
   * 
   * Note that topics that does not included in this builder might not be supported by Exchangedataset API.
   * @returns this
   */
  topics(tops: string[]): SnapshotBitfinexChannelsBuilder;
  /**
   * Build this bulder to get topics.
   * Can be called more than once.
   * @returns An array of topics
   */
  build(): string[];
}

/**
 * @internal
 */
class Impl implements SnapshotBitfinexChannelsBuilder {
  private stored: string[];

  constructor() {
    this.stored = [];
  }

  subscribed(channels: string[]): SnapshotBitfinexChannelsBuilder {
    const topics = channels.map((ch) => `${SNAPSHOT_TOPIC_SUBSCRIBED}_${ch}`);
    return this.topics(topics);
  }
  
  book(pairs: string[]): SnapshotBitfinexChannelsBuilder {
    const topics = pairs.map((pair) => `book_${pair}`);
    return this.topics(topics);
  }

  topics(tops: string[]): SnapshotBitfinexChannelsBuilder {
    this.stored.push(...tops);
    return this;
  }

  build(): string[] {
    // this shallow copies an array
    return this.stored.slice(0);
  }
}

export function snapshotBitfinex(): SnapshotBitfinexChannelsBuilder {
  return new Impl();
}
