/**
 * Viewport Parser.
 *
 * Provides utilities for extracting and interpreting viewport information
 * from skill requests. Viewport data tells you about the device's display
 * capabilities.
 */

import {
  AlexaSkillRequest,
  ViewportContext,
  ViewportObject,
  APLViewportObject,
  APLTViewportObject,
  ViewportType,
  APLTProfile,
  APLTFormat,
  InterSegment,
  SupportedInterfaces,
} from "../types/common";

// ===========================================================================
// Interface support detection
// ===========================================================================

/**
 * Get the supported interfaces from the skill request.
 */
export function getSupportedInterfaces(
  request: AlexaSkillRequest,
): SupportedInterfaces {
  return request.context.System.device.supportedInterfaces;
}

/**
 * Check if the device supports APL (screen display).
 */
export function supportsAPL(request: AlexaSkillRequest): boolean {
  const interfaces = getSupportedInterfaces(request);
  return "Alexa.Presentation.APL" in interfaces;
}

/**
 * Check if the device supports APLA (audio).
 * Note: APLA is available on all Alexa devices.
 */
export function supportsAPLA(request: AlexaSkillRequest): boolean {
  // APLA is available on all Alexa devices; checking supportedInterfaces
  // is not strictly necessary but we check if explicitly listed.
  const interfaces = getSupportedInterfaces(request);
  return "Alexa.Presentation.APLA" in interfaces;
}

/**
 * Check if the device supports APLT (character display).
 */
export function supportsAPLT(request: AlexaSkillRequest): boolean {
  const interfaces = getSupportedInterfaces(request);
  return "Alexa.Presentation.APLT" in interfaces;
}

/**
 * Get the maximum APL runtime version supported by the device.
 * Returns undefined if APL is not supported.
 */
export function getAPLMaxVersion(
  request: AlexaSkillRequest,
): string | undefined {
  const interfaces = getSupportedInterfaces(request);
  return interfaces["Alexa.Presentation.APL"]?.runtime.maxVersion;
}

/**
 * Get the maximum APLT runtime version supported by the device.
 * Returns undefined if APLT is not supported.
 */
export function getAPLTMaxVersion(
  request: AlexaSkillRequest,
): string | undefined {
  const interfaces = getSupportedInterfaces(request);
  return interfaces["Alexa.Presentation.APLT"]?.runtime.maxVersion;
}

/**
 * Check if a custom or additional interface is available on the device.
 * Use this for interfaces not explicitly modeled in `SupportedInterfaces`.
 *
 * @param interfaceName The full interface name (e.g., "Alexa.RemoteVideoPlayer")
 */
export function hasAdditionalInterface(
  request: AlexaSkillRequest,
  interfaceName: string,
): boolean {
  const interfaces = getSupportedInterfaces(request);
  return interfaceName in (interfaces.additionalInterfaces ?? {});
}

/**
 * Get the configuration for a custom or additional interface.
 * Returns undefined if the interface is not present.
 *
 * @param interfaceName The full interface name (e.g., "Alexa.RemoteVideoPlayer")
 */
export function getAdditionalInterface(
  request: AlexaSkillRequest,
  interfaceName: string,
): Record<string, unknown> | undefined {
  const interfaces = getSupportedInterfaces(request);
  return interfaces.additionalInterfaces?.[interfaceName];
}

// ===========================================================================
// Viewport extraction
// ===========================================================================

/**
 * Get the primary viewport (singular Viewport object).
 */
export function getViewport(
  request: AlexaSkillRequest,
): ViewportContext | undefined {
  return request.context.Viewport;
}

/**
 * Get all viewports from the Viewports array.
 */
export function getViewports(request: AlexaSkillRequest): ViewportObject[] {
  return request.context.Viewports ?? [];
}

/**
 * Get viewports of a specific type (APL or APLT).
 */
export function getViewportsByType(
  request: AlexaSkillRequest,
  type: ViewportType,
): ViewportObject[] {
  return getViewports(request).filter((v) => v.type === type);
}

/**
 * Get the first APL viewport (screen device).
 * Returns a narrowed `APLViewportObject` with screen-specific properties.
 */
export function getAPLViewport(
  request: AlexaSkillRequest,
): APLViewportObject | undefined {
  return getViewportsByType(request, "APL")[0] as
    | APLViewportObject
    | undefined;
}

/**
 * Get the first APLT viewport (character display).
 * Returns a narrowed `APLTViewportObject` with character display properties.
 */
export function getAPLTViewport(
  request: AlexaSkillRequest,
): APLTViewportObject | undefined {
  return getViewportsByType(request, "APLT")[0] as
    | APLTViewportObject
    | undefined;
}

// ===========================================================================
// APLT viewport utilities
// ===========================================================================

/**
 * Get the supported profiles for an APLT viewport.
 */
export function getAPLTSupportedProfiles(
  viewport: APLTViewportObject,
): APLTProfile[] {
  return viewport.supportedProfiles ?? [];
}

/**
 * Get the character format for an APLT viewport.
 */
export function getAPLTCharacterFormat(
  viewport: APLTViewportObject,
): APLTFormat | undefined {
  return viewport.format;
}

/**
 * Get the display dimensions (in characters) for an APLT viewport.
 */
export function getAPLTDisplaySize(viewport: APLTViewportObject):
  | {
      lineLength: number;
      lineCount: number;
    }
  | undefined {
  if (viewport.lineLength !== undefined && viewport.lineCount !== undefined) {
    return {
      lineLength: viewport.lineLength,
      lineCount: viewport.lineCount,
    };
  }
  return undefined;
}

/**
 * Get the inter-segment characters for an APLT viewport.
 */
export function getAPLTInterSegments(
  viewport: APLTViewportObject,
): InterSegment[] {
  return viewport.interSegments ?? [];
}

// ===========================================================================
// Viewport type guards
// ===========================================================================

/**
 * Check if a viewport is an APL screen viewport.
 */
export function isAPLViewport(
  viewport: ViewportObject,
): viewport is APLViewportObject {
  return viewport.type === "APL";
}

/**
 * Check if a viewport is an APLT character display viewport.
 */
export function isAPLTViewport(
  viewport: ViewportObject,
): viewport is APLTViewportObject {
  return viewport.type === "APLT";
}

// ===========================================================================
// APL viewport utilities
// ===========================================================================

/**
 * Get the pixel dimensions of the primary viewport.
 */
export function getViewportPixelSize(request: AlexaSkillRequest):
  | {
      pixelWidth: number;
      pixelHeight: number;
    }
  | undefined {
  const viewport = getViewport(request);
  if (viewport) {
    return {
      pixelWidth: viewport.pixelWidth,
      pixelHeight: viewport.pixelHeight,
    };
  }
  return undefined;
}

/**
 * Get the current pixel dimensions of the viewport (may differ from
 * the maximum if the viewport has been resized).
 */
export function getCurrentViewportPixelSize(request: AlexaSkillRequest):
  | {
      currentPixelWidth: number;
      currentPixelHeight: number;
    }
  | undefined {
  const viewport = getViewport(request);
  if (viewport) {
    return {
      currentPixelWidth: viewport.currentPixelWidth,
      currentPixelHeight: viewport.currentPixelHeight,
    };
  }
  return undefined;
}

/**
 * Get the DPI of the viewport.
 */
export function getViewportDPI(request: AlexaSkillRequest): number | undefined {
  const viewport = getViewport(request);
  return viewport?.dpi;
}

/**
 * Get the shape of the viewport (RECTANGLE or ROUND).
 */
export function getViewportShape(
  request: AlexaSkillRequest,
): string | undefined {
  const viewport = getViewport(request);
  return viewport?.shape;
}

/**
 * Check if the viewport supports touch interaction.
 */
export function supportsTouch(request: AlexaSkillRequest): boolean {
  const viewport = getViewport(request);
  return (viewport?.touch?.length ?? 0) > 0;
}

/**
 * Check if the viewport supports keyboard interaction.
 */
export function supportsKeyboard(request: AlexaSkillRequest): boolean {
  const viewport = getViewport(request);
  return (viewport?.keyboard?.length ?? 0) > 0;
}

/**
 * Get the video codecs supported by the device.
 */
export function getSupportedVideoCodecs(request: AlexaSkillRequest): string[] {
  const viewport = getViewport(request);
  return viewport?.video?.codecs ?? [];
}

// ===========================================================================
// Extensions context
// ===========================================================================

/**
 * Get available extensions from the request context.
 * Returns a map where each key is the extension URI.
 */
export function getAvailableExtensions(
  request: AlexaSkillRequest,
): Record<string, Record<string, unknown>> {
  return request.context.Extensions?.available ?? {};
}

/**
 * Check if a specific extension is available on the device.
 * @param extensionUri The URI of the extension (e.g., "alexaext:smartmotion:10")
 */
export function isExtensionAvailable(
  request: AlexaSkillRequest,
  extensionUri: string,
): boolean {
  const extensions = getAvailableExtensions(request);
  return extensionUri in extensions;
}
