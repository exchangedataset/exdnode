import { SNAPSHOT_TOPIC_SUBSCRIBED } from "../../../constants";

export interface FilterBitflyerChannelsBuilder {
  /**
   * Subscribed message of specified channels.
   * @param chs Channels to take snapshot of subscribed message
   */
  subscribed(chs: string[]): FilterBitflyerChannelsBuilder;
  /**
   * L2 book snapshot of specified pairs.
   * @param pairs Pairs to filter-in
   */
  boardSnapshot(pairs: string[]): FilterBitflyerChannelsBuilder;
  /**
   * Add an arbitrary topics.
   * 
   * Note that topics that does not included in this builder might not be supported by Exchangedataset API.
   * @returns this
   */
  topics(tops: string[]): FilterBitflyerChannelsBuilder;
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
class Impl implements FilterBitflyerChannelsBuilder {
  private stored: string[];

  constructor() {
    this.stored = [];
  }

  subscribed(chs: string[]): FilterBitflyerChannelsBuilder {
    const tops = chs.map((ch) => `${SNAPSHOT_TOPIC_SUBSCRIBED}_${ch}`);
    return this.topics(tops);
  }
  boardSnapshot(pairs: string[]): FilterBitflyerChannelsBuilder {
    const chs = pairs.map((pair) => `lightning_board_snapshot_${pair}`);
    return this.topics(chs);
  }

  topics(chs: string[]): FilterBitflyerChannelsBuilder {
    this.stored.push(...chs);
    return this;
  }

  build(): string[] {
    // this shallow copies an array
    return this.stored.slice(0);
  }
}

export function filterBitflyer(): FilterBitflyerChannelsBuilder {
  return new Impl();
}
