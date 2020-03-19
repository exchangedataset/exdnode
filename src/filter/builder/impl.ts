import { FilterBuilder } from "./builder";
import { Filter } from "../filter";

export class FilterBuilderImpl implements FilterBuilder {
  private filter: Filter;

  constructor() {
    // initialize filter
    this.filter = {};
  }

  build(): Filter {
    // we can deep clone filter object like this because filter object only has strings
    return JSON.parse(JSON.stringify(this.filter));
  }

  bitmex(channels: string[]): FilterBuilder {
    return this.exchange('bitmex', channels);
  }

  bitflyer(channels: string[]): FilterBuilder {
    return this.exchange('bitflyer', channels);
  }

  bitfinex(channels: string[]): FilterBuilder {
    return this.exchange('bitfinex', channels);
  }

  exchange(exchangeName: string, channels: string[]): FilterBuilder {
    if (!(exchangeName in this.filter)) {
      this.filter[exchangeName] = channels;
      return this;
    }
    // channels for this exchange are already pushed, add channles to it
    // remove duplicate from channels parameter
    const noduplicate = channels.filter((ch) => !(ch in this.filter.channels));
    this.filter.channels.push(...noduplicate);
    return this;
  }
}