import { ClientParam } from '../../client/client';
import { setupClientSetting } from '../../client/impl';
import { AnyDateTime, AnyMinute } from '../../utils/datetime';
import { setupFilterSetting, _filter } from './impl';
import { Shard } from '../../common/line';

/**
 * Parameters to make new request to Filter HTTP Endpoint.
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
   * What channels to filter-in after being formatted.
   */
  postFilter: string[];
  /**
   * Start date-time.
   */
  start: AnyDateTime;
  /**
   * End date-time.
   */
  end: AnyDateTime;
  /**
   * Minute of the shard.
   */
  minute: AnyMinute;
  /**
   * What format to get response in.
   */
  format: string;
}

/**
 * Returns `Promise` of {@link Shard}s for given client and filter parameter.
 * @param clientParam Client parameter
 * @param param Filter parameter
 */
export async function filter(clientParam: ClientParam, param: FilterParam): Promise<Shard<string>> {
  if (typeof clientParam === 'undefined') throw new Error("'clientParam' must be specified")
  if (typeof param === 'undefined') throw new Error("'param' must be specified")
  return await _filter(setupClientSetting(clientParam), setupFilterSetting(param))
}
