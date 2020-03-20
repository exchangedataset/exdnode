export interface FilterBitmexChannelsBuilder {
  /**
   * Announcements from Bitmex.
   * @returns this
   */
  announcement(): FilterBitmexChannelsBuilder;
  /**
   * Trollbox chat.
   * @returns this
   */
  chat(): FilterBitmexChannelsBuilder;
  /**
   * Statistics of connected users or bots.
   * @returns this
   */
  connected(): FilterBitmexChannelsBuilder;
  /**
   * Updates of swap funding rates.
   * @returns this
   */
  funding(): FilterBitmexChannelsBuilder;
  /**
   * Instrument updates such as turnover, bid and ask.
   * @returns this
   */
  instrument(): FilterBitmexChannelsBuilder;
  /**
   * Daily Insurance Fund updates.
   * @returns this
   */
  insurance(): FilterBitmexChannelsBuilder;
  /**
   * Liquidation orders as they're entered into the book.
   * @returns this
   */
  liquidation(): FilterBitmexChannelsBuilder;
  /**
   * Full level 2 order book.
   * @returns this
   */
  orderBookL2(): FilterBitmexChannelsBuilder;
  /**
   * System-wide notifications.
   * @returns this
   */
  publicNotifications(): FilterBitmexChannelsBuilder;
  /**
   * Settlements.
   * @returns this
   */
  settlement(): FilterBitmexChannelsBuilder;
  /**
   * Live trades.
   * @returns this
   */
  trade(): FilterBitmexChannelsBuilder;
  /**
   * Add an arbitrary channels.
   * Duplicate entry will be aggregated.
   * 
   * Note that channels that does not included in this builder might not be supported by Exchangedataset API.
   * @returns this
   */
  channels(chs: string[]): FilterBitmexChannelsBuilder;
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
class Impl implements FilterBitmexChannelsBuilder {
  private stored: string[];

  constructor() {
    this.stored = [];
  }

  announcement(): FilterBitmexChannelsBuilder { return this.channels(['announcement']); }
  chat(): FilterBitmexChannelsBuilder { return this.channels(['chat']); }
  connected(): FilterBitmexChannelsBuilder { return this.channels(['connected']); }
  funding(): FilterBitmexChannelsBuilder { return this.channels(['funding']); }
  instrument(): FilterBitmexChannelsBuilder { return this.channels(['instrument']); }
  insurance(): FilterBitmexChannelsBuilder { return this.channels(['insurance']); }
  liquidation(): FilterBitmexChannelsBuilder { return this.channels(['liquidation']); }
  orderBookL2(): FilterBitmexChannelsBuilder { return this.channels(['orderBookL2']); }
  publicNotifications(): FilterBitmexChannelsBuilder { return this.channels(['publicNotifications']); }
  settlement(): FilterBitmexChannelsBuilder { return this.channels(['settlement']); }
  trade(): FilterBitmexChannelsBuilder { return this.channels(['trade']); }

  channels(chs: string[]): FilterBitmexChannelsBuilder {
    this.stored.push(...chs);
    return this;
  }

  build(): string[] {
    // this shallow copies an array
    return this.stored.slice(0);
  }
}

export function filterBitmex(): FilterBitmexChannelsBuilder {
  return new Impl();
}
