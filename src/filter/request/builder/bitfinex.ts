export interface FilterBitfinexChannelsBuilder {
  /**
   * Trades of specified pairs.
   * @param pairs Pairs to filter-in
   */
  trades(pairs: string[]): FilterBitfinexChannelsBuilder;
  /**
   * L2 book of specified pairs.
   * @param pairs Pairs to filter-in
   */
  book(pairs: string[]): FilterBitfinexChannelsBuilder;
  /**
   * Add an arbitrary channels.
   * Duplicate entry will be aggregated.
   * 
   * Note that channels that does not included in this builder might not be supported by Exchangedataset API.
   * @returns this
   */
  channels(chs: string[]): FilterBitfinexChannelsBuilder;
  /**
   * Build this bulder to get channels.
   * Can be called more than once.
   * @returns An array of channels
   */
  build(): string[];
}

/**
 * @internal
 */
class Impl implements FilterBitfinexChannelsBuilder {
  private stored: string[];

  constructor() {
    this.stored = [];
  }

  trades(pairs: string[]): FilterBitfinexChannelsBuilder {
    const chs = pairs.map((pair) => `trades_${pair}`);
    return this.channels(chs);
  }
  book(pairs: string[]): FilterBitfinexChannelsBuilder {
    const chs = pairs.map((pair) => `book_${pair}`);
    return this.channels(chs);
  }

  channels(chs: string[]): FilterBitfinexChannelsBuilder {
    this.stored.push(...chs);
    return this;
  }

  build(): string[] {
    // this shallow copies an array
    return this.stored.slice(0);
  }
}

export function filterBitfinex(): FilterBitfinexChannelsBuilder {
  return new Impl();
}
