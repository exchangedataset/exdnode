import { Filter } from '../common/param';
import { AnyDateInstance } from '../utils/datetime';
import { Line } from '../common/line';
import { ClientParam } from '../client/client';
import { setupClientSetting } from '../client/impl';
import { ReplayRequestImpl, setupReplayRequestSetting } from './impl';

/**
 * Parameters neccesary to send request to API server.
 */
export type ReplayRequestParam = {
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
}

export type ReplayMessage = string | {
  [key: string]: any;
};

export interface ReplayRequest {
  /**
   * Send request and download response in an array.
   * All data would be lost if there was an error while downloading
   * any more than one part of request, including when your API-key quota runs out.
   */
  download(): Promise<Line<ReplayMessage>[]>;
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
   * One shard is equavalent to one minute. Optional.
   * @returns Object implements `AsyncIterable` which yields response line by line from buffer.
   */
  stream(): AsyncIterable<Line<ReplayMessage>>;
}

export function replay(clientParam: ClientParam, param: ReplayRequestParam): ReplayRequest {
  return new ReplayRequestImpl(setupClientSetting(clientParam), setupReplayRequestSetting(param));
}

export * from './builder/builder';
