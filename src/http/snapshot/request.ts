import { SnapshotResponse } from "./response";

/**
 * Request to snapshot HTTP-API endpoint.
 */
export interface SnapshotRequest {
  /**
   * Send request to server.
   */
  download(): Promise<SnapshotResponse>;
}

export * from './builder/builder';
