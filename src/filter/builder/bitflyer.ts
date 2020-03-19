export type BitflyerPairs = 'BTC_JPY' | 'FX_BTC_JPY' | 'ETH_BTC' | 'BCH_BTC' | 'ETH_JPY' | 'BTCJPY?????????';

export interface FilterBitflyerChannelsBuilder {
  /**
   * Executions of specified pairs.
   * @param pairs Pairs to filter-in
   */
  executions(...pairs: string[]): FilterBitflyerChannelsBuilder;
  /**
   * L2 book snapshot of specified pairs.
   * @param pairs Pairs to filter-in
   */
  boardSnapshot(...pairs: string[]): FilterBitflyerChannelsBuilder;
  /**
   * L2 book change of specified pairs.
   * @param pairs Pairs to filter-in
   */
  board(...pairs: string[]): FilterBitflyerChannelsBuilder;
  /**
   * Ticker of specified pairs.
   * @param pairs Pairs to filter-in
   */
  ticker(...pairs: string[]): FilterBitflyerChannelsBuilder;
  /**
   * Add an arbitrary channels.
   * Duplicate entry will be aggregated.
   * 
   * Note that channels that does not included in this builder might not be supported by Exchangedataset API.
   * @returns this
   */
  channels(...chs: string[]): FilterBitflyerChannelsBuilder;
  /**
   * Build this bulder to get channels.
   * Can be called more than once.
   * @returns An array of channels
   */
  build(): string[];
}

class Impl implements FilterBitflyerChannelsBuilder {
  private stored: string[];

  constructor() {
    this.stored = [];
  }

  executions(...pairs: string[]): FilterBitflyerChannelsBuilder {
    const chs = pairs.map((pair) => `lightning_executions_${pair}`);
    return this.channels(...chs);
  }
  boardSnapshot(...pairs: string[]): FilterBitflyerChannelsBuilder {
    const chs = pairs.map((pair) => `lightning_board_snapshot_${pair}`);
    return this.channels(...chs);
  }
  board(...pairs: string[]): FilterBitflyerChannelsBuilder {
    const chs = pairs.map((pair) => `lightning_board_${pair}`);
    return this.channels(...chs);
  }
  ticker(...pairs: string[]): FilterBitflyerChannelsBuilder {
    const chs = pairs.map((pair) => `lightning_ticker_${pair}`);
    return this.channels(...chs);
  }

  channels(...chs: string[]): FilterBitflyerChannelsBuilder {
    const noduplicate = chs.filter((ch) => !(ch in this.channels));
    this.stored.push(...noduplicate);
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
