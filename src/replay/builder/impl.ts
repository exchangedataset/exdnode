/**
 * @internal
 * @packageDocumentation
 */

import { ReplayRequestBuilder } from "./builder";
import { ReplayRequest } from "../replay";
import { AnyDateInstance } from "../../utils/datetime";
import { ClientSetting } from "../../client/impl";
import { setupRawRequestSetting } from "../../raw/impl";
import { RawRequestParam } from "../../raw/raw";
import { ReplayRequestImpl } from "../impl";

export class ReplayRequestBuilderImpl implements ReplayRequestBuilder {
  private config: { [key: string]: any } = {
    filter: {},
  };

  constructor(private clientSetting: ClientSetting) {}

  build(): ReplayRequest {
    return new ReplayRequestImpl(this.clientSetting, setupRawRequestSetting(this.config as RawRequestParam));
  }

  bitmex(channels: string[]): ReplayRequestBuilder {
    return this.exchange('bitmex', channels);
  }

  bitflyer(channels: string[]): ReplayRequestBuilder {
    return this.exchange('bitflyer', channels);
  }

  bitfinex(channels: string[]): ReplayRequestBuilder {
    return this.exchange('bitfinex', channels);
  }

  exchange(exchangeName: string, channels: string[]): ReplayRequestBuilder {
    if (!(exchangeName in this.config)) {
      this.config.filter[exchangeName] = channels;
      return this;
    }
    this.config.filter[exchangeName].push(...channels);
    return this;
  }
  start(date: AnyDateInstance): ReplayRequestBuilder {
    this.config.start = date;
    return this;
  }
  end(date: AnyDateInstance): ReplayRequestBuilder {
    this.config.end = date;
    return this;
  }
  range(start: AnyDateInstance, end?: AnyDateInstance): ReplayRequestBuilder {
    return this.start(start).end(typeof end === 'undefined' ? start : end);
  }

  asRaw(): ReplayRequest {
    this.config.format = 'none';
    return this.build();
  }
  asCSVLike(): ReplayRequest {
    this.config.format = 'csvlike';
    return this.build();
  }
}
