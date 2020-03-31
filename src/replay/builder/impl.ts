/**
 * @internal
 * @packageDocumentation
 */

import { ReplayRequestParamBuilder } from "./builder";
import { ReplayRequestParam } from "../replay";
import { AnyDateInstance } from "../../utils/datetime";

export class FilterRequestBuilderImpl implements ReplayRequestParamBuilder {
  private config: { [key: string]: any } = {
    filter: {},
  };

  build(): ReplayRequestParam {
    return this.config as ReplayRequestParam;
  }

  bitmex(channels: string[]): ReplayRequestParamBuilder {
    return this.exchange('bitmex', channels);
  }

  bitflyer(channels: string[]): ReplayRequestParamBuilder {
    return this.exchange('bitflyer', channels);
  }

  bitfinex(channels: string[]): ReplayRequestParamBuilder {
    return this.exchange('bitfinex', channels);
  }

  exchange(exchangeName: string, channels: string[]): ReplayRequestParamBuilder {
    if (!(exchangeName in this.config)) {
      this.config.filter[exchangeName] = channels;
      return this;
    }
    this.config.filter[exchangeName].push(...channels);
    return this;
  }
  start(date: AnyDateInstance): ReplayRequestParamBuilder {
    this.config.start = date;
    return this;
  }
  end(date: AnyDateInstance): ReplayRequestParamBuilder {
    this.config.end = date;
    return this;
  }
  range(start: AnyDateInstance, end?: AnyDateInstance): ReplayRequestParamBuilder {
    return this.start(start).end(typeof end === 'undefined' ? start : end);
  }

  asRaw(): ReplayRequestParam {
    this.config.format = 'none';
    return this.build();
  }
  asCSVLike(): ReplayRequestParam {
    this.config.format = 'csvlike';
    return this.build();
  }
}
