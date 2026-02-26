/**
 * VideoApp Request Handlers.
 *
 * Handles incoming playback lifecycle requests from the VideoApp interface:
 *   - PlaybackStarted:  Video playback began
 *   - PlaybackFinished: Video playback completed
 *   - PlaybackStopped:  Video playback was interrupted
 *   - PlaybackFailed:   Video playback encountered an error
 *
 * Also provides device capability detection and utility functions
 * for extracting playback state from requests.
 */

import {
  Request,
  AlexaSkillRequest,
} from "../types/common";
import {
  VideoAppPlaybackStartedRequest,
  VideoAppPlaybackFinishedRequest,
  VideoAppPlaybackStoppedRequest,
  VideoAppPlaybackFailedRequest,
  VideoAppPlaybackError,
  VideoAppErrorType,
} from "../types/videoapp";

// ===========================================================================
// Request type guards
// ===========================================================================

/**
 * Check if a request is any VideoApp playback request.
 */
export function isVideoAppRequest(request: Request): boolean {
  return request.type.startsWith("VideoApp.");
}

/**
 * Check if a request is a VideoApp.PlaybackStarted request.
 */
export function isVideoAppPlaybackStarted(
  request: Request,
): request is VideoAppPlaybackStartedRequest {
  return request.type === "VideoApp.PlaybackStarted";
}

/**
 * Check if a request is a VideoApp.PlaybackFinished request.
 */
export function isVideoAppPlaybackFinished(
  request: Request,
): request is VideoAppPlaybackFinishedRequest {
  return request.type === "VideoApp.PlaybackFinished";
}

/**
 * Check if a request is a VideoApp.PlaybackStopped request.
 */
export function isVideoAppPlaybackStopped(
  request: Request,
): request is VideoAppPlaybackStoppedRequest {
  return request.type === "VideoApp.PlaybackStopped";
}

/**
 * Check if a request is a VideoApp.PlaybackFailed request.
 */
export function isVideoAppPlaybackFailed(
  request: Request,
): request is VideoAppPlaybackFailedRequest {
  return request.type === "VideoApp.PlaybackFailed";
}

// ===========================================================================
// Request data extraction utilities
// ===========================================================================

/**
 * Extract the playback offset (in milliseconds) from any VideoApp
 * playback request. Returns undefined for requests that don't have
 * an offset (e.g., some failure cases).
 */
export function getVideoPlaybackOffset(
  request:
    | VideoAppPlaybackStartedRequest
    | VideoAppPlaybackFinishedRequest
    | VideoAppPlaybackStoppedRequest
    | VideoAppPlaybackFailedRequest,
): number | undefined {
  return request.offsetInMilliseconds;
}

/**
 * Extract the playback offset as seconds (rounded down).
 * Convenience wrapper for display/logging.
 */
export function getVideoPlaybackOffsetSeconds(
  request:
    | VideoAppPlaybackStartedRequest
    | VideoAppPlaybackFinishedRequest
    | VideoAppPlaybackStoppedRequest
    | VideoAppPlaybackFailedRequest,
): number | undefined {
  const ms = request.offsetInMilliseconds;
  return ms !== undefined ? Math.floor(ms / 1000) : undefined;
}

/**
 * Extract the error details from a VideoApp.PlaybackFailed request.
 */
export function getVideoPlaybackError(
  request: VideoAppPlaybackFailedRequest,
): VideoAppPlaybackError {
  return request.error;
}

/**
 * Extract just the error type from a VideoApp.PlaybackFailed request.
 */
export function getVideoPlaybackErrorType(
  request: VideoAppPlaybackFailedRequest,
): VideoAppErrorType {
  return request.error.type;
}

// ===========================================================================
// Device support detection
// ===========================================================================

/**
 * Check if the device supports the VideoApp interface.
 * Always check this before sending a VideoApp.Launch directive.
 */
export function supportsVideoApp(request: AlexaSkillRequest): boolean {
  const interfaces =
    request.context.System.device.supportedInterfaces;
  return "VideoApp" in interfaces;
}
