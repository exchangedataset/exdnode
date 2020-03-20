/**
 * @internal
 * @packageDocumentation
 */

import { AnyDateInstance } from "../../utils/datetime";
import { ClientSetting } from "../../client/impl";
import { FilterRequest } from "./request";
import { FilterRequestImpl, setupSetting } from "./request.impl";
import { FilterParam } from "../filter";
import { FilterRequestBuilder } from "./builder";

export class FilterRequestBuilderImpl implements FilterRequestBuilder {
  private config: { [key: string]: any };

  constructor(private clientSetting: ClientSetting) {
    // initialize filter
    this.config = { filter: {} };
  }

  build(): FilterRequest {
    // we can deep clone filter object like this because filter object only has strings
    const config = JSON.parse(JSON.stringify(this.config));
    return new FilterRequestImpl(this.clientSetting, setupSetting(config));
  }

  bitmex(channels: string[]): FilterRequestBuilder {
    return this.exchange('bitmex', channels);
  }

  bitflyer(channels: string[]): FilterRequestBuilder {
    return this.exchange('bitflyer', channels);
  }

  bitfinex(channels: string[]): FilterRequestBuilder {
    return this.exchange('bitfinex', channels);
  }

  exchange(exchangeName: string, channels: string[]): FilterRequestBuilder {
    if (!(exchangeName in this.config)) {
      this.config.filter[exchangeName] = channels;
      return this;
    }
    this.config.filter[exchangeName].push(...channels);
    return this;
  }
  start(date: AnyDateInstance): FilterRequestBuilder {
    this.config.start = date;
    return this;
  }
  end(date: AnyDateInstance): FilterRequestBuilder {
    this.config.end = date;
    return this;
  }
  range(start: AnyDateInstance, end?: AnyDateInstance): FilterRequestBuilder {
    return this.start(start).end(typeof end === 'undefined' ? start : end);
  }

  asRaw(): FilterRequest {
    this.config.format = 'none';
    return this.configure(this.config as FilterParam);
  }
  asCSVLike(): FilterRequest {
    this.config.format = 'csvlike';
    return this.configure(this.config as FilterParam);
  }
  configure(params: FilterParam): FilterRequest {
    return new FilterRequestImpl(this.clientSetting, setupSetting(params));
  }
}
