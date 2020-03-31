/**
 * Contains response from server for snapshot HTTP-API call.
 */
export type SnapshotResponse = {
  /**
   * Topic and its snapshot.
   */
  [key: string]: string;
}
