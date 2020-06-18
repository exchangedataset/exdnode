import { Filter } from '../common/param';
import { AnyDateTime } from '../utils/datetime';
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
  start: AnyDateTime;
  /**
   * End date-time.
   */
  end: AnyDateTime;
}

export type ReplayMessage = string | {
  [key: string]: any;
};

export interface ReplayRequest {
  /**
   * Send requests and download responses in an array.
   * 
   * All data will be lost if there was an error while downloading
   * any part of the request, including when your API-key quota runs out.
   */
  download(): Promise<Line<ReplayMessage>[]>;
  /**
   * Send requests to the server and read responses by streaming.
   *
   * Returns Iterable object yields a response line by line.
   * Can be iterated using for-async-of sentence.
   * Iterator yields a line immidiately if it is bufferred, waits for it to be downloaded if not avaliable.
   *
   * **Please note that buffering won't start by calling this method,**
   * **calling {@link AsyncIterable.[Symbol.asyncIterator]} will.**
   *
   * Higher responsiveness than {@link download} is expected as it does not have to wait for
   * the entire data to be downloaded.
   *
   * @param bufferSize Optional. Desired buffer size to store streaming data.
   * One shard is equavalent to one minute.
   * @returns Object implements `AsyncIterable` which yields response line by line from buffer.
   */
  stream(bufferSize?: number): AsyncIterable<Line<ReplayMessage>>;
}

export function replay(clientParam: ClientParam, param: ReplayRequestParam): ReplayRequest {
  return new ReplayRequestImpl(setupClientSetting(clientParam), setupReplayRequestSetting(param));
}
