/**
 * Alexa.DataStore Interface types.
 *
 * Provides requests that notify the skill about errors that might occur
 * when updating the data store on a device. The data store is a local
 * area on the device containing data that APL documents can access via
 * data binding. Widgets use the data store to display content without
 * requiring a round-trip to the skill.
 *
 * Requests:
 *   - DataStoreError
 */

import { Request } from "./common";

// ===========================================================================
// Data Store Commands (referenced in error payloads)
// ===========================================================================

/**
 * A data store command as used in the Data Store REST API.
 * These are included in error notifications to identify what failed.
 */
export type DataStoreCommand =
  | PutObjectCommand
  | RemoveObjectCommand
  | RemoveNamespaceCommand
  | ClearCommand;

export interface PutObjectCommand {
  type: "PUT_OBJECT";
  namespace: string;
  key: string;
  content: Record<string, unknown>;
}

export interface RemoveObjectCommand {
  type: "REMOVE_OBJECT";
  namespace: string;
  key: string;
}

export interface RemoveNamespaceCommand {
  type: "REMOVE_NAMESPACE";
  namespace: string;
}

export interface ClearCommand {
  type: "CLEAR";
}

// ===========================================================================
// Error types
// ===========================================================================

export type DataStoreErrorType =
  | "DEVICE_PERMANENTLY_UNAVAILABLE"
  | "DEVICE_UNAVAILABLE"
  | "DATASTORE_INTERNAL_ERROR"
  | "STORAGE_LIMIT_EXCEEDED";

/**
 * Error content for DEVICE_UNAVAILABLE and DEVICE_PERMANENTLY_UNAVAILABLE.
 * Contains the device ID and the consolidated commands that failed.
 */
export interface DeviceUnavailableErrorContent {
  deviceId: string;
  commands: DataStoreCommand[];
}

/**
 * Error content for STORAGE_LIMIT_EXCEEDED and DATASTORE_INTERNAL_ERROR.
 * Contains the device ID and the single command that failed.
 */
export interface StorageLimitErrorContent {
  deviceId: string;
  failedCommand: DataStoreCommand;
  message?: string;
}

/**
 * Union type for the error object in a DataStoreError request.
 */
export type DataStoreError =
  | DeviceUnavailableError
  | DevicePermanentlyUnavailableError
  | StorageLimitExceededError
  | DataStoreInternalError;

export interface DeviceUnavailableError {
  type: "DEVICE_UNAVAILABLE";
  content: DeviceUnavailableErrorContent;
}

export interface DevicePermanentlyUnavailableError {
  type: "DEVICE_PERMANENTLY_UNAVAILABLE";
  content: DeviceUnavailableErrorContent;
}

export interface StorageLimitExceededError {
  type: "STORAGE_LIMIT_EXCEEDED";
  content: StorageLimitErrorContent;
}

export interface DataStoreInternalError {
  type: "DATASTORE_INTERNAL_ERROR";
  content: StorageLimitErrorContent;
}

// ===========================================================================
// REQUESTS
// ===========================================================================

/**
 * Sent to notify the skill when a data store update failed due to an error.
 * The request includes details that can be used to attempt the update again.
 *
 * Note: The documentation property table specifies the type as
 * `Alexa.DataStore.DataStoreError`, while the JSON examples use
 * `Alexa.DataStore.Error`. Both forms are accepted.
 */
export interface DataStoreErrorRequest extends Request {
  type: "Alexa.DataStore.DataStoreError" | "Alexa.DataStore.Error";
  error: DataStoreError;
}
