/**
 * @internal
 * @packageDocumentation
 */

import { FilterLine, FilterRequest } from "./filter";
import { ClientSetting } from "../../client/impl";
import filterDownload from "./download";
import StreamIterator from "./stream/iterator";
import { FilterSetting } from "./impl";

export class FilterRequestImpl implements FilterRequest {
  constructor(private clientSetting: ClientSetting, private setting: FilterSetting) {}

  async download(): Promise<FilterLine[]> {
    return filterDownload(this.clientSetting, this.setting);
  }

  stream(bufferSize?: number): AsyncIterable<FilterLine> {
    const clientSetting = this.clientSetting;
    const setting = this.setting;
    return {
      [Symbol.asyncIterator](): AsyncIterator<FilterLine> {
        return new StreamIterator(clientSetting, setting, bufferSize);
      },
    };
  }
}
