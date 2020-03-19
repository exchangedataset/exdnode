export type BitfinexPairs = 'tBTC_USD' | 'tETH_USD' | 'USTUSD' | 'tEOSUSD' | 'tBCHUSD' | 'tXRPUSD' | 'tLTCUSD';

export interface FilterBitfinexChannelsBuilder {
  /**
   * Trades of specified pairs.
   * @param pairs Pairs to filter-in
   */
  trades(...pairs: BitfinexPairs[]): FilterBitfinexChannelsBuilder;
  /**
   * L2 book of specified pairs.
   * @param pairs Pairs to filter-in
   */
  book(...pairs: BitfinexPairs[]): FilterBitfinexChannelsBuilder;
  /**
   * Add an arbitrary channels.
   * Duplicate entry will be aggregated.
   * 
   * Note that channels that does not included in this builder might not be supported by Exchangedataset API.
   * @returns this
   */
  channels(...chs: string[]): FilterBitfinexChannelsBuilder;
  /**
   * Build this bulder to get channels.
   * Can be called more than once.
   * @returns An array of channels
   */
  build(): string[];
}

class Impl implements FilterBitfinexChannelsBuilder {
  private stored: string[];

  constructor() {
    this.stored = [];
  }

  trades(...pairs: string[]): FilterBitfinexChannelsBuilder {
    const chs = pairs.map((pair) => `trades_${pair}`);
    return this.channels(...chs);
  }
  book(...pairs: string[]): FilterBitfinexChannelsBuilder {
    const chs = pairs.map((pair) => `book_${pair}`);
    return this.channels(...chs);
  }

  channels(...chs: string[]): FilterBitfinexChannelsBuilder {
    const noduplicate = chs.filter((ch) => !(ch in this.channels));
    this.stored.push(...noduplicate);
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
