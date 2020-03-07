import { ClientParam } from '../client/client';
import { setupSetting as setupFilterSetting, FilterRequestImpl } from './impl';
import { setupSetting as setupClientSetting } from '../client/impl';

import moment = require('moment');

export type FilterParam = {
  exchange: string;
  start: string | Date | number | moment.Moment;
  end: string | Date | number | moment.Moment;
  channels: string[];
}

/**
 * Enum of line type.
 *
 * Line type shows what type of a line it is, such as message line or start line.
 * Lines with different types contain different information and have to be treated differently.
 *
 * @see FilterLine
 */
export enum LineType {
  MESSAGE = 1,
  SEND,
  START,
  END,
  ERROR,
}

/**
 * Data structure of a single line from a filter response.
 *
 * `type` and `timestamp` is always present, **but `channel` or `message` is not.**
 * This is because with certain `type`, a line might not contain `channel` or `message`, or both.
 *
 * @see FilterLine.type
 */
export type FilterLine = {
  /**
   * If `type === LineType.MESSAGE`, then a line is a normal message.
   * All of value are present.
   * You can get an assosiated channel by `channel`, and its message by `message`.
   *
   * If `type === LineType.SEND`, then a line is a request server sent when the dataset was
   * recorded.
   * All of value are present, though you can ignore this line.
   *
   * If `type === LineType.START`, then a line marks the start of new continuous recording of the
   * dataset.
   * Only `channel` is not present. `message` is the URL which used to record the dataset.
   * You might want to initialize your work since this essentially means new connection to
   * exchange's API.
   *
   * If `type === LineType.END`, then a line marks the end of continuous recording of the dataset.
   * Other than `type` and `timestamp` are not present.
   * You might want to perform some functionality when the connection to exchange's API was lost.
   *
   * If `type === LineType.ERROR`, then a line contains error message when recording the dataset.
   * Only `channel` is not present. `message` is the error message.
   * You want to ignore this line.
   *
   * @see FilterLine
   */
  type: LineType;
  /**
   * Timestamp in nano seconds in unixtime-compatible format (unixtime * 10^9 + nanosec-part)
   * of this line was recorded.
   * Timezone is UTC.
   */
  timestamp: bigint;
  /**
   * Channel name which this line is assosiated with.
   * Can be `undefined` according to `type`.
   * @see type
   */
  channel?: string;
  /**
   * Message.
   * Can be `undefined` according to `type`.
   * @see type
   */
  message?: string;
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
  download(): Promise<FilterLine[]>;

  /**
   * Read response by streaming.
   *
   * Returns Iterable object yields response line by line.
   * Can be iterated using for-async-of sentence.
   * Iterator yields immidiately if a line is bufferred, waits for download if not avaliable.
   *
   * **Please note that buffering won't start by calling this method,**
   * **calling {@link AsyncIterable.[Symbol.asyncIterator]} will.**
   *
   * Higher responsiveness than {@link downloadAsArray} is expected as it does not have to wait for
   * the entire data to be downloaded.
   *
   * @param bufferSize Desired buffer size to store streaming data.
   * One dataset is equavalent to one minute. Optional.
   * @returns Object implements `AsyncIterable` which yields response line by line from buffer.
   */
  stream(bufferSize?: number): AsyncIterable<FilterLine>;
}

export function filter(clientParams: ClientParam, params: FilterParam): FilterRequest {
  return new FilterRequestImpl(setupClientSetting(clientParams), setupFilterSetting(params));
}
