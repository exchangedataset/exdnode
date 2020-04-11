import { ClientParam } from '../../client/client';
import { setupClientSetting } from '../../client/impl';
import { AnyDateInstance } from '../../utils/datetime';
import { setupFilterRequestSetting, filterDownload } from './impl';
import { Shard } from '../../common/line';

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
   * Minute in unixtime/60 to get a shard.
   */
  minute: number;
  /**
   * What format to get response in.
   */
  format: string;
}

/**
 * Returns `Promise` of {@link FilterRequest} for given client and filter parameter.
 * @param clientParam Client parameter
 * @param param Filter parameter
 */
export async function filter(clientParam: ClientParam, param: FilterParam): Promise<Shard<string>> {
  if (typeof clientParam === 'undefined') throw new Error("'clientParam' must be specified")
  if (typeof param === 'undefined') throw new Error("'param' must be specified")
  return await filterDownload(setupClientSetting(clientParam), setupFilterRequestSetting(param))
}
