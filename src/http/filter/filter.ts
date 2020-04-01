import { ClientParam } from '../../client/client';
import { setupClientSetting } from '../../client/impl';
import { AnyDateInstance } from '../../utils/datetime';
import { setupFilterRequestSetting, FilterRequestImpl } from './impl';
import { Line, Shard } from '../../common/line';

/**
 * Parameters to make new {@link FilterRequest}.
 */
export type FilterParam = {
  /**
   * What exchange to filter-in.
   */
  exchange: string;
  /**
   * What channels to filter-in.
   */
  channels: string[];
  /**
   * Start date-time.
   */
  start: AnyDateInstance;
  /**
   * End date-time.
   */
  end: AnyDateInstance;
  /**
   * What format to get response in.
   */
  format: string;
}

/**
 * Request to filter API.
 *
 * You can pick the way to read the response:
 * - {@link download} to immidiately start downloading the whole
 * response as one array.
 * - {@link stream} to return iterable object yields line by line.
 */
export interface FilterRequest {
  /**
   * Send request to server and return an array of {@link Shard}.
   * @returns Promise of response splitted in multiple {@link Shard}s
   */
  download(): Promise<Shard[]>;

  /**
   * Send request to server and read response by streaming.
   *
   * Returns Iterable object yields response line by line.
   * Can be iterated using for-async-of sentence.
   * Iterator yields immidiately if a line is bufferred, waits for download if not avaliable.
   *
   * **Please note that buffering won't start by calling this method,**
   * **calling {@link AsyncIterable.[Symbol.asyncIterator]} will.**
   *
   * Higher responsiveness than {@link download} is expected as it does not have to wait for
   * the entire data to be downloaded.
   *
   * @param bufferSize Desired buffer size to store streaming data.
   * One dataset is equavalent to one minute. Optional.
   * @returns Object implements `AsyncIterable` which yields response line by line from buffer.
   */
  stream(bufferSize?: number): AsyncIterable<Line>;
}

/**
 * Returns {@link FilterRequest} for given client and filter parameter.
 * @param clientParams Client parameter
 * @param params Filter parameter
 */
export function filter(clientParams: ClientParam, params: FilterParam): FilterRequest {
  return new FilterRequestImpl(setupClientSetting(clientParams), setupFilterRequestSetting(params));
}
