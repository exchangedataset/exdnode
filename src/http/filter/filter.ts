import { ClientParam } from '../../client/client';
import { setupSetting as setupClientSetting } from '../../client/impl';
import { FilterRequest } from './request';
import { AnyDateInstance } from '../../utils/datetime';
import { setupSetting as setupFilterSetting } from './impl';
import { FilterRequestImpl } from './request.impl';

/**
 * Specify exchanges as key and their channels as an array of strings to filter.
 */
export type Filter = { [key: string]: string[] };
/**
 * Parameters to make new {@link FilterRequest}.
 */
export type FilterParam = {
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
   * What format to get response in.
   */
  format: string;
}

/**
 * Enum of Line Type.
 *
 * Line Type shows what type of a line it is, such as message line or start line.
 * Lines with different types contain different information and have to be treated differently.
 *
 * @see FilterLine
 */
export enum LineType {
  /**
   * Message Line Type.
   * 
   * This is the most usual Line Type.
   */
  MESSAGE = 'msg',
  /**
   * Send Line Type.
   * 
   * Message send from one of our client when recording.
   */
  SEND = 'send',
  /**
   * Start Line Type.
   * 
   * Indicates the first line in the continuous recording.
   */
  START = 'start',
  /**
   * End Line Type.
   * 
   * Indicates the end line in the continuous recording.
   */
  END = 'end',
  /**
   * Error Line Type.
   * 
   * Used when error occurrs on recording.
   * Used in both server-side error and client-side error.
   */
  ERROR = 'err',
}

/**
 * Data structure of a single line from a filter response.
 *
 * `exchange`, `type` and `timestamp` is always present, **but `channel` or `message` is not.**
 * This is because with certain `type`, a line might not contain `channel` or `message`, or both.
 *
 * @see FilterLine.type
 */
export type FilterLine = {
  /**
   * Exchange on which this line is recorded.
   */
  exchange: string;
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
 * Returns {@link FilterRequest} for given client and filter parameter.
 * @param clientParams Client parameter
 * @param params Filter parameter
 */
export function filter(clientParams: ClientParam, params: FilterParam): FilterRequest {
  return new FilterRequestImpl(setupClientSetting(clientParams), setupFilterSetting(params));
}

export * from './request';
