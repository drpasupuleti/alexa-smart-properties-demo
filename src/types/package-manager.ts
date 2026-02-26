/**
 * Alexa.DataStore.PackageManager Interface types.
 *
 * Provides requests that inform the skill when Alexa installs, removes,
 * and updates an APL package on a device. A package is a self-contained
 * resource used to render an APL experience on a specific viewport,
 * such as a widget.
 *
 * Requests:
 *   - UsagesInstalled
 *   - UsagesRemoved
 *   - UpdateRequest
 *   - InstallationError
 */

import { Request } from "./common";

// ===========================================================================
// Package usage types
// ===========================================================================

/**
 * Describes a single usage of a package on a device.
 */
export interface PackageUsage {
  instanceId?: string;
  location: PackageLocation;
}

export type PackageLocation = "FAVORITE";

// ===========================================================================
// Installation error types
// ===========================================================================

export type PackageInstallationErrorType = "PACKAGEMANAGER_INTERNAL_ERROR";

export interface PackageInstallationError {
  type: PackageInstallationErrorType;
  content: Record<string, unknown>;
}

// ===========================================================================
// REQUESTS
// ===========================================================================

/**
 * Sent to the skill when Alexa installs the package on a user's device.
 * This request applies when `installStateChanges` is set to `INFORM`
 * in the package manifest.
 */
export interface UsagesInstalledRequest extends Request {
  type: "Alexa.DataStore.PackageManager.UsagesInstalled";
  payload: {
    packageId: string;
    packageVersion: string;
    usages: PackageUsage[];
  };
}

/**
 * Sent to the skill when a user removes the widget from a device
 * and Alexa uninstalls the package.
 */
export interface UsagesRemovedRequest extends Request {
  type: "Alexa.DataStore.PackageManager.UsagesRemoved";
  payload: {
    packageId: string;
    packageVersion: string;
    usages: PackageUsage[];
  };
}

/**
 * Sent to the skill when Alexa updates the package on a user's device
 * with a new version. This request applies when `updateStateChanges`
 * is set to `INFORM` in the package manifest.
 */
export interface UpdateRequestRequest extends Request {
  type: "Alexa.DataStore.PackageManager.UpdateRequest";
  packageId: string;
  fromVersion: string;
  toVersion: string;
}

/**
 * Sent to notify the skill about any errors that happened during
 * package installation, removal, or updates.
 */
export interface InstallationErrorRequest extends Request {
  type: "Alexa.DataStore.PackageManager.InstallationError";
  packageId: string;
  version: string;
  error?: PackageInstallationError;
}
