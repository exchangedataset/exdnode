/**
 * @internal
 * @packageDocumentation
 */

import { AnyDateInstance } from "../../../utils/datetime";
import { ClientSetting } from "../../../client/impl";
import { FilterRequest } from "../request";
import { FilterRequestImpl } from "../request.impl";
import { FilterRequestBuilder } from "./builder";
import { FilterParam } from "../filter";
import { setupSetting } from "../impl";

export class FilterRequestBuilderImpl implements FilterRequestBuilder {
  private config: { [key: string]: any };

  constructor(private clientSetting: ClientSetting) {
    // initialize filter
    this.config = { filter: {} };
  }

  build(): FilterRequest {
    return new FilterRequestImpl(this.clientSetting, setupSetting(this.config as FilterParam));
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
    return this.build();
  }
  asCSVLike(): FilterRequest {
    this.config.format = 'csvlike';
    return this.build();
  }
}
