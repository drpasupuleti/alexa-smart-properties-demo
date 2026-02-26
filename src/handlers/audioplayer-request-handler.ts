/**
 * AudioPlayer Request Handlers.
 *
 * Handles incoming playback lifecycle requests from the AudioPlayer interface:
 *   - PlaybackStarted:        Audio began playing
 *   - PlaybackFinished:       Audio finished (reached end of stream)
 *   - PlaybackStopped:        Audio was stopped
 *   - PlaybackNearlyFinished: Audio is almost done (enqueue next track)
 *   - PlaybackFailed:         Audio encountered an error
 *
 * Also provides device capability detection, type guards, and
 * utility functions for extracting playback state.
 */

import {
  Request,
  AlexaSkillRequest,
} from "../types/common";
import {
  AudioPlayerPlaybackStartedRequest,
  AudioPlayerPlaybackFinishedRequest,
  AudioPlayerPlaybackStoppedRequest,
  AudioPlayerPlaybackNearlyFinishedRequest,
  AudioPlayerPlaybackFailedRequest,
  AudioPlayerError,
  AudioPlayerErrorType,
  AudioPlayerActivity,
  AudioPlayerCurrentPlaybackState,
} from "../types/audioplayer";

// ===========================================================================
// Request type guards
// ===========================================================================

/**
 * Check if a request is any AudioPlayer playback request.
 */
export function isAudioPlayerRequest(request: Request): boolean {
  return request.type.startsWith("AudioPlayer.");
}

/**
 * Check if a request is an AudioPlayer.PlaybackStarted request.
 */
export function isAudioPlayerPlaybackStarted(
  request: Request,
): request is AudioPlayerPlaybackStartedRequest {
  return request.type === "AudioPlayer.PlaybackStarted";
}

/**
 * Check if a request is an AudioPlayer.PlaybackFinished request.
 */
export function isAudioPlayerPlaybackFinished(
  request: Request,
): request is AudioPlayerPlaybackFinishedRequest {
  return request.type === "AudioPlayer.PlaybackFinished";
}

/**
 * Check if a request is an AudioPlayer.PlaybackStopped request.
 */
export function isAudioPlayerPlaybackStopped(
  request: Request,
): request is AudioPlayerPlaybackStoppedRequest {
  return request.type === "AudioPlayer.PlaybackStopped";
}

/**
 * Check if a request is an AudioPlayer.PlaybackNearlyFinished request.
 * This is the cue to enqueue the next track.
 */
export function isAudioPlayerPlaybackNearlyFinished(
  request: Request,
): request is AudioPlayerPlaybackNearlyFinishedRequest {
  return request.type === "AudioPlayer.PlaybackNearlyFinished";
}

/**
 * Check if a request is an AudioPlayer.PlaybackFailed request.
 */
export function isAudioPlayerPlaybackFailed(
  request: Request,
): request is AudioPlayerPlaybackFailedRequest {
  return request.type === "AudioPlayer.PlaybackFailed";
}

// ===========================================================================
// Request data extraction utilities
// ===========================================================================

/**
 * Extract the stream token from any AudioPlayer playback request.
 */
export function getAudioPlayerToken(
  request:
    | AudioPlayerPlaybackStartedRequest
    | AudioPlayerPlaybackFinishedRequest
    | AudioPlayerPlaybackStoppedRequest
    | AudioPlayerPlaybackNearlyFinishedRequest
    | AudioPlayerPlaybackFailedRequest,
): string {
  return request.token;
}

/**
 * Extract the playback offset (in milliseconds) from a playback request.
 * Available on Started, Finished, Stopped, and NearlyFinished requests.
 */
export function getAudioPlayerOffset(
  request:
    | AudioPlayerPlaybackStartedRequest
    | AudioPlayerPlaybackFinishedRequest
    | AudioPlayerPlaybackStoppedRequest
    | AudioPlayerPlaybackNearlyFinishedRequest,
): number {
  return request.offsetInMilliseconds;
}

/**
 * Extract the playback offset as seconds (rounded down).
 */
export function getAudioPlayerOffsetSeconds(
  request:
    | AudioPlayerPlaybackStartedRequest
    | AudioPlayerPlaybackFinishedRequest
    | AudioPlayerPlaybackStoppedRequest
    | AudioPlayerPlaybackNearlyFinishedRequest,
): number {
  return Math.floor(request.offsetInMilliseconds / 1000);
}

/**
 * Extract the error details from an AudioPlayer.PlaybackFailed request.
 */
export function getAudioPlayerError(
  request: AudioPlayerPlaybackFailedRequest,
): AudioPlayerError {
  return request.error;
}

/**
 * Extract just the error type from an AudioPlayer.PlaybackFailed request.
 */
export function getAudioPlayerErrorType(
  request: AudioPlayerPlaybackFailedRequest,
): AudioPlayerErrorType {
  return request.error.type;
}

/**
 * Extract the playback state at the time of failure.
 */
export function getAudioPlayerFailureState(
  request: AudioPlayerPlaybackFailedRequest,
): AudioPlayerCurrentPlaybackState {
  return request.currentPlaybackState;
}

// ===========================================================================
// Context utilities
// ===========================================================================

/**
 * Get the current AudioPlayer activity from the request context.
 * Returns undefined if the AudioPlayer context is not present.
 */
export function getAudioPlayerActivity(
  request: AlexaSkillRequest,
): AudioPlayerActivity | undefined {
  return request.context.AudioPlayer?.playerActivity as
    | AudioPlayerActivity
    | undefined;
}

/**
 * Check if audio is currently playing based on the request context.
 */
export function isAudioPlaying(request: AlexaSkillRequest): boolean {
  return request.context.AudioPlayer?.playerActivity === "PLAYING";
}

/**
 * Get the token of the currently active stream from the request context.
 * Returns undefined if no stream is active.
 */
export function getActiveAudioToken(
  request: AlexaSkillRequest,
): string | undefined {
  return request.context.AudioPlayer?.token as string | undefined;
}

/**
 * Get the current playback offset from the request context.
 * Returns undefined if no stream is active.
 */
export function getActiveAudioOffset(
  request: AlexaSkillRequest,
): number | undefined {
  return request.context.AudioPlayer?.offsetInMilliseconds as
    | number
    | undefined;
}

// ===========================================================================
// Device support detection
// ===========================================================================

/**
 * Check if the device supports the AudioPlayer interface.
 * Always check this before sending AudioPlayer directives.
 */
export function supportsAudioPlayer(request: AlexaSkillRequest): boolean {
  const interfaces =
    request.context.System.device.supportedInterfaces;
  return "AudioPlayer" in interfaces;
}
