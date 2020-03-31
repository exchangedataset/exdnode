import { SNAPSHOT_TOPIC_SUBSCRIBED } from "../../../constants";

export interface SnapshotBitmexChannelsBuilder {
  /**
   * Subscribed message of specified channels.
   * @param chs Channels to take snapshot of subscribed message
   */
  subscribed(chs: string[]): SnapshotBitmexChannelsBuilder;
  /**
   * Full level 2 order book.
   * @returns this
   */
  orderBookL2(): SnapshotBitmexChannelsBuilder;
  /**
   * Add an arbitrary topics.
   * 
   * Note that topics that does not included in this builder might not be supported by Exchangedataset API.
   * @returns this
   */
  topics(tops: string[]): SnapshotBitmexChannelsBuilder;
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
class Impl implements SnapshotBitmexChannelsBuilder {
  private stored: string[];

  constructor() {
    this.stored = [];
  }

  subscribed(chs: string[]): SnapshotBitmexChannelsBuilder {
    const tops = chs.map((ch) => `${SNAPSHOT_TOPIC_SUBSCRIBED}_${ch}`);
    return this.topics(tops);
  }
  orderBookL2(): SnapshotBitmexChannelsBuilder { return this.topics(['orderBookL2']); }

  topics(tops: string[]): SnapshotBitmexChannelsBuilder {
    this.stored.push(...tops);
    return this;
  }

  build(): string[] {
    // this shallow copies an array
    return this.stored.slice(0);
  }
}

export function filterBitmex(): SnapshotBitmexChannelsBuilder {
  return new Impl();
}
