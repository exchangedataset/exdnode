import { Line } from "../common/line";
import { Filter } from "../common/param";
import { AnyDateInstance } from "../utils/datetime";
import { ClientParam } from "../client/client";
import { setupSetting as setupClientSetting} from "../client/impl";
import { RawRequestImpl, setupSetting as setupRawRequestSetting } from "./impl";

/**
 * Parameters to make new {@link RawRequest}.
 */
export type RawRequestParam = {
  /**
   * What exchanges and channels to filter-in.
   */
  filter: Filter;
  /**
   * Start date-time.
   */
  start: AnyDateInstance;
  /**
   * End date-time.
   */
  end: AnyDateInstance;
  /**
   * What format to receive response with.
   * If you specify raw, then you will get result in raw format that the exchanges are providing with.
   * If you specify csvlike, then you will get result formatted in csv-like structure.
   */
  format: "raw" | "csvlike";
}

/**
 * Replays market data in raw format.
 */
export interface RawRequest {
  /**
   * Send request and download response in an array.
   */
  download(): Promise<Line[]>;
  /**
   * Stream response line by line.
   */
  stream(): AsyncIterable<Line>;
}

export function raw(clientParam: ClientParam, param: RawRequestParam): RawRequest {
  return new RawRequestImpl(setupClientSetting(clientParam), setupRawRequestSetting(param));
}
