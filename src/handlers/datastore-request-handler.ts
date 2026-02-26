/**
 * Alexa.DataStore Request Handlers.
 *
 * Handles incoming DataStore error requests:
 *   - DataStoreError: A data store update failed
 *
 * Error types:
 *   - DEVICE_UNAVAILABLE: Device offline after attemptDeliveryUntil
 *   - DEVICE_PERMANENTLY_UNAVAILABLE: Device registration changed
 *   - DATASTORE_INTERNAL_ERROR: Internal error in data store
 *   - STORAGE_LIMIT_EXCEEDED: Data store storage limit exceeded
 */

import { Request, AlexaSkillRequest } from "../types/common";
import {
  DataStoreErrorRequest,
  DataStoreError,
  DataStoreErrorType,
  DataStoreCommand,
  DeviceUnavailableError,
  DevicePermanentlyUnavailableError,
  StorageLimitExceededError,
  DataStoreInternalError,
  DeviceUnavailableErrorContent,
  StorageLimitErrorContent,
} from "../types/datastore";

// ===========================================================================
// Handler interfaces
// ===========================================================================

/**
 * Handler for DataStoreError requests.
 * Sent when a data store update fails due to an error.
 */
export interface DataStoreErrorHandler {
  canHandle(request: DataStoreErrorRequest): boolean;
  handle(
    request: DataStoreErrorRequest,
    fullRequest: AlexaSkillRequest,
  ): void | Promise<void>;
}

// ===========================================================================
// Request type guards
// ===========================================================================

export function isDataStoreError(
  request: Request,
): request is DataStoreErrorRequest {
  return (
    request.type === "Alexa.DataStore.DataStoreError" ||
    request.type === "Alexa.DataStore.Error"
  );
}

// ===========================================================================
// Error type guards
// ===========================================================================

export function isDeviceUnavailableError(
  error: DataStoreError,
): error is DeviceUnavailableError {
  return error.type === "DEVICE_UNAVAILABLE";
}

export function isDevicePermanentlyUnavailableError(
  error: DataStoreError,
): error is DevicePermanentlyUnavailableError {
  return error.type === "DEVICE_PERMANENTLY_UNAVAILABLE";
}

export function isStorageLimitExceededError(
  error: DataStoreError,
): error is StorageLimitExceededError {
  return error.type === "STORAGE_LIMIT_EXCEEDED";
}

export function isDataStoreInternalError(
  error: DataStoreError,
): error is DataStoreInternalError {
  return error.type === "DATASTORE_INTERNAL_ERROR";
}

// ===========================================================================
// Data extraction utilities
// ===========================================================================

/**
 * Extract the error from a DataStoreError request.
 */
export function getDataStoreError(
  request: DataStoreErrorRequest,
): DataStoreError {
  return request.error;
}

/**
 * Extract the error type from a DataStoreError request.
 */
export function getDataStoreErrorType(
  request: DataStoreErrorRequest,
): DataStoreErrorType {
  return request.error.type;
}

/**
 * Extract the device ID from any DataStore error.
 */
export function getErrorDeviceId(error: DataStoreError): string {
  return error.content.deviceId;
}

/**
 * Extract the failed commands from a DEVICE_UNAVAILABLE or
 * DEVICE_PERMANENTLY_UNAVAILABLE error. These are consolidated
 * commands that were sent to the unreachable device, ordered by
 * original request time.
 */
export function getFailedCommands(
  error: DeviceUnavailableError | DevicePermanentlyUnavailableError,
): DataStoreCommand[] {
  return error.content.commands;
}

/**
 * Extract the single failed command from a STORAGE_LIMIT_EXCEEDED
 * or DATASTORE_INTERNAL_ERROR.
 */
export function getFailedCommand(
  error: StorageLimitExceededError | DataStoreInternalError,
): DataStoreCommand {
  return error.content.failedCommand;
}

/**
 * Extract the error message from a STORAGE_LIMIT_EXCEEDED or
 * DATASTORE_INTERNAL_ERROR, if available.
 */
export function getErrorMessage(
  error: StorageLimitExceededError | DataStoreInternalError,
): string | undefined {
  return error.content.message;
}

// Re-export types for convenience
export type {
  DataStoreErrorType,
  DeviceUnavailableErrorContent,
  StorageLimitErrorContent,
};
