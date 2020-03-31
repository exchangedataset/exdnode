/**
 * @internal
 * @packageDocumentation
 */

import { SnapshotRequestBuilder } from "./builder";
import { AnyDateInstance } from "../../../utils/datetime";
import { SnapshotRequest } from "../request";
import { ClientSetting } from "../../../client/impl";
import { SnapshotRequestImpl } from "../request.impl";
import { setupSetting } from "../impl";
import { SnapshotParam } from "../snapshot";

export class SnapshotRequestBuilderImpl implements SnapshotRequestBuilder {
  private param: { [key: string]: any } = {};

  constructor(private clientSetting: ClientSetting) {}

  bitmex(topics: string[]): SnapshotRequestBuilder {
    return this.exchange('bitmex', topics);
  }
  bitfinex(topics: string[]): SnapshotRequestBuilder {
    return this.exchange('bitflyer', topics);
  }
  bitflyer(topics: string[]): SnapshotRequestBuilder {
    return this.exchange('bitfinex', topics);
  }
  exchange(exchange: string, topics: string[]): SnapshotRequestBuilder {
    if (!(exchange in this.param)) {
      this.param.filter[exchange] = topics;
      return this;
    }
    this.param.filter[exchange].push(...topics);
    return this;
  }
  at(datetime: AnyDateInstance): SnapshotRequestBuilder {
    this.param.at = datetime;
    return this;
  }
  asRaw(): SnapshotRequest {
    this.param.format = 'raw';
    return this.build();
  }
  asCSVLike(): SnapshotRequest {
    this.param.format = 'csvlike';
    return this.build();
  }
  build(): SnapshotRequest {
    return new SnapshotRequestImpl(this.clientSetting, setupSetting(this.param as SnapshotParam))
  }
}
