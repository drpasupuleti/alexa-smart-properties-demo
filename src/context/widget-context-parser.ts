/**
 * Widget Context Parser.
 *
 * Provides utilities for extracting and interpreting widget information
 * from skill requests. When the skill includes a widget, the request
 * may include additional information about that widget.
 */

import {
  AlexaSkillRequest,
  VisibleComponent,
  InstalledPackage,
} from "../types/common";
import {
  WidgetContext,
  AlexaPresentationWidgetContexts,
} from "../types/widget";

// ===========================================================================
// Widget context extraction
// ===========================================================================

/**
 * Get all widget contexts from the skill request.
 * Widget contexts are in the `Alexa.Presentation[contexts]` array.
 * Each context represents a visible widget associated with your skill.
 */
export function getWidgetContexts(request: AlexaSkillRequest): WidgetContext[] {
  const presentation = request.context["Alexa.Presentation"] as
    | AlexaPresentationWidgetContexts
    | undefined;
  if (!presentation?.contexts) {
    return [];
  }

  // Filter to contexts that have a presentationUri (widget contexts)
  return presentation.contexts.filter(
    (ctx): ctx is WidgetContext => !!ctx.presentationUri,
  );
}

/**
 * Get the widget context for a specific widget identified by its presentation URI.
 */
export function getWidgetContextByUri(
  request: AlexaSkillRequest,
  presentationUri: string,
): WidgetContext | undefined {
  const contexts = getWidgetContexts(request);
  return contexts.find((ctx) => ctx.presentationUri === presentationUri);
}

/**
 * Check if any widgets are visible in the current request.
 */
export function hasVisibleWidgets(request: AlexaSkillRequest): boolean {
  return getWidgetContexts(request).length > 0;
}

/**
 * Get the components visible on screen for a specific widget.
 */
export function getWidgetVisibleComponents(
  request: AlexaSkillRequest,
  presentationUri: string,
): VisibleComponent[] {
  const widgetCtx = getWidgetContextByUri(request, presentationUri);
  return widgetCtx?.componentsVisibleOnScreen ?? [];
}

// ===========================================================================
// Package manager context extraction
// ===========================================================================

/**
 * Get the installed packages from the request context.
 * Returns packages installed on the device that are associated with your skill.
 */
export function getInstalledPackages(
  request: AlexaSkillRequest,
): InstalledPackage[] {
  return (
    request.context["Alexa.DataStore.PackageManager"]?.installedPackages ?? []
  );
}

/**
 * Check if a specific package is installed on the device.
 */
export function isPackageInstalled(
  request: AlexaSkillRequest,
  packageId: string,
): boolean {
  const packages = getInstalledPackages(request);
  return packages.some((pkg) => pkg.packageId === packageId);
}

/**
 * Get the installed version of a specific package.
 * Returns undefined if the package is not installed.
 */
export function getInstalledPackageVersion(
  request: AlexaSkillRequest,
  packageId: string,
): string | undefined {
  const packages = getInstalledPackages(request);
  const pkg = packages.find((p) => p.packageId === packageId);
  return pkg?.packageVersion;
}

// ===========================================================================
// Presentation URI from main APL context
// ===========================================================================

/**
 * Get the presentation URI from the main APL presentation context.
 * This is present when the request was triggered by a widget interaction.
 */
export function getPresentationUri(
  request: AlexaSkillRequest,
): string | undefined {
  return request.context["Alexa.Presentation.APL"]?.presentationUri;
}

/**
 * Check if the current request was triggered from a widget.
 */
export function isWidgetRequest(request: AlexaSkillRequest): boolean {
  return !!getPresentationUri(request);
}
