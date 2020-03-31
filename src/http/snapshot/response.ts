/**
 * Contains response from server for snapshot HTTP-API call.
 */
export type SnapshotResponse = {
  /**
   * Exchange and its snapshot.
   */
  [key: string]: string;
}
