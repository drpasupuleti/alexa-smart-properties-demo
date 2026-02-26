/**
 * Alexa.DataStore.PackageManager Request Handlers.
 *
 * Handles incoming PackageManager requests:
 *   - UsagesInstalled: Package installed on a user's device
 *   - UsagesRemoved: Package removed from a user's device
 *   - UpdateRequest: Package updated on a user's device
 *   - InstallationError: Error during package installation/removal/update
 */

import {
  Request,
  AlexaSkillRequest,
  AlexaSkillResponse,
} from "../types/common";
import {
  UsagesInstalledRequest,
  UsagesRemovedRequest,
  UpdateRequestRequest,
  InstallationErrorRequest,
  PackageUsage,
  PackageInstallationError,
} from "../types/package-manager";

// ===========================================================================
// Handler interfaces
// ===========================================================================

/**
 * Handler for UsagesInstalled requests.
 * Use this to update the data store with initial data for the widget.
 */
export interface UsagesInstalledHandler {
  canHandle(request: UsagesInstalledRequest): boolean;
  handle(
    request: UsagesInstalledRequest,
    fullRequest: AlexaSkillRequest,
  ): AlexaSkillResponse | Promise<AlexaSkillResponse>;
}

/**
 * Handler for UsagesRemoved requests.
 * Use this to clear data from the data store for the removed widget.
 */
export interface UsagesRemovedHandler {
  canHandle(request: UsagesRemovedRequest): boolean;
  handle(
    request: UsagesRemovedRequest,
    fullRequest: AlexaSkillRequest,
  ): AlexaSkillResponse | Promise<AlexaSkillResponse>;
}

/**
 * Handler for UpdateRequest requests.
 * Use this to update the data store with data for the new widget version.
 */
export interface UpdateRequestHandler {
  canHandle(request: UpdateRequestRequest): boolean;
  handle(
    request: UpdateRequestRequest,
    fullRequest: AlexaSkillRequest,
  ): AlexaSkillResponse | Promise<AlexaSkillResponse>;
}

/**
 * Handler for InstallationError requests.
 */
export interface InstallationErrorHandler {
  canHandle(request: InstallationErrorRequest): boolean;
  handle(
    request: InstallationErrorRequest,
    fullRequest: AlexaSkillRequest,
  ): void | Promise<void>;
}

// ===========================================================================
// Request type guards
// ===========================================================================

export function isUsagesInstalled(
  request: Request,
): request is UsagesInstalledRequest {
  return request.type === "Alexa.DataStore.PackageManager.UsagesInstalled";
}

export function isUsagesRemoved(
  request: Request,
): request is UsagesRemovedRequest {
  return request.type === "Alexa.DataStore.PackageManager.UsagesRemoved";
}

export function isUpdateRequest(
  request: Request,
): request is UpdateRequestRequest {
  return request.type === "Alexa.DataStore.PackageManager.UpdateRequest";
}

export function isInstallationError(
  request: Request,
): request is InstallationErrorRequest {
  return request.type === "Alexa.DataStore.PackageManager.InstallationError";
}

export function isPackageManagerRequest(request: Request): boolean {
  return (
    isUsagesInstalled(request) ||
    isUsagesRemoved(request) ||
    isUpdateRequest(request) ||
    isInstallationError(request)
  );
}

// ===========================================================================
// Data extraction utilities
// ===========================================================================

/**
 * Extract the package ID from a UsagesInstalled request.
 */
export function getInstalledPackageId(request: UsagesInstalledRequest): string {
  return request.payload.packageId;
}

/**
 * Extract the package version from a UsagesInstalled request.
 */
export function getInstalledRequestPackageVersion(
  request: UsagesInstalledRequest,
): string {
  return request.payload.packageVersion;
}

/**
 * Extract the usages from a UsagesInstalled request.
 */
export function getInstalledUsages(
  request: UsagesInstalledRequest,
): PackageUsage[] {
  return request.payload.usages;
}

/**
 * Extract the package ID from a UsagesRemoved request.
 */
export function getRemovedPackageId(request: UsagesRemovedRequest): string {
  return request.payload.packageId;
}

/**
 * Extract the usages from a UsagesRemoved request.
 */
export function getRemovedUsages(
  request: UsagesRemovedRequest,
): PackageUsage[] {
  return request.payload.usages;
}

/**
 * Extract the package ID from an UpdateRequest request.
 */
export function getUpdatePackageId(request: UpdateRequestRequest): string {
  return request.packageId;
}

/**
 * Extract the version transition from an UpdateRequest.
 */
export function getUpdateVersions(request: UpdateRequestRequest): {
  fromVersion: string;
  toVersion: string;
} {
  return {
    fromVersion: request.fromVersion,
    toVersion: request.toVersion,
  };
}

/**
 * Extract the error from an InstallationError request.
 */
export function getInstallationError(
  request: InstallationErrorRequest,
): PackageInstallationError | undefined {
  return request.error;
}
