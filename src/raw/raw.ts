import { Line } from "../common/line";
import { Filter } from "../common/param";
import { AnyDateTime } from "../utils/datetime";
import { ClientParam } from "../client/client";
import { setupClientSetting} from "../client/impl";
import { RawRequestImpl, setupRawRequestSetting } from "./impl";

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
  start: AnyDateTime;
  /**
   * End date-time.
   */
  end: AnyDateTime;
  /**
   * What format to receive response with.
   * If you specify raw, then you will get result in raw format that the exchanges are providing with.
   * If you specify json, then you will get result formatted in JSON format.
   */
  format: "raw" | "json";
}

/**
 * Replays market data in raw format.
 *
 * You can pick the way to read the response:
 * - {@link download} to immidiately start downloading the whole
 * response as one array.
 * - {@link stream} to return iterable object yields line by line.
 */
export interface RawRequest {
  /**
   * Send request and download response in an array.
   */
  download(): Promise<Line<string>[]>;
  /**
   * Send requests to the server and read response by streaming.
   *
   * Returns Iterable object yields response line by line.
   * Can be iterated using for-async-of sentence.
   * Iterator yields immidiately if a line is bufferred, waits for download if not avaliable.
   *
   * **Please note that buffering won't start by calling this method,**
   * **calling {@link AsyncIterator.next()} will.**
   *
   * Higher responsiveness than {@link download} is expected as it does not have to wait for
   * the entire data to be downloaded.
   *
   * @param bufferSize Optional. Desired buffer size to store streaming data.
   * One shard is equavalent to one minute.
   * @returns Object implements `AsyncIterable` from which iterator that yields response line by line from buffer can be obtained.
   */
  stream(bufferSize?: number): AsyncIterable<Line<string>>;
}

/**
 * Creates new `RawRequest` with the given parameters.
 * @param clientParam Client parameter
 * @param param Request parameter
 */
export function raw(clientParam: ClientParam, param: RawRequestParam): RawRequest {
  return new RawRequestImpl(setupClientSetting(clientParam), setupRawRequestSetting(param));
}
