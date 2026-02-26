/**
 * VideoApp Interface types.
 *
 * The VideoApp interface allows skills to stream native, full-screen video
 * playback on screen-capable Alexa devices (Echo Show, Fire TV, etc.).
 * Unlike APL video components which render within a document layout, the
 * VideoApp interface takes over the entire screen for media playback.
 *
 * Directives:
 *   - Launch: Start playing a video in native full-screen mode
 *
 * Requests (device → skill):
 *   - PlaybackStarted:  Video playback has started
 *   - PlaybackFinished: Video playback has completed
 *   - PlaybackStopped:  Video playback was interrupted (user navigated away)
 *   - PlaybackFailed:   Video playback encountered an error
 */

import { Directive, Request } from "./common";

// ===========================================================================
// Video item types
// ===========================================================================

/**
 * A single video source URL. The device will attempt each source in order
 * until it finds one it can play.
 */
export interface VideoSource {
  /** The URL of the video stream. Must be HTTPS. */
  url: string;
  /**
   * The size of the video in bytes. Optional but recommended for
   * the device to provide progress indicators.
   */
  sizeInBytes?: number;
  /**
   * The offset in milliseconds to start playback from.
   * Defaults to 0 (beginning of video).
   */
  offsetInMilliseconds?: number;
}

/**
 * Metadata about the video to display in the device's native UI.
 */
export interface VideoMetadata {
  /** The title of the video displayed during playback. */
  title?: string;
  /** The subtitle (e.g., episode name, show title). */
  subtitle?: string;
}

/**
 * A video item containing one or more sources and optional metadata.
 */
export interface VideoItem {
  /** One or more video source URLs, tried in order. */
  sources: VideoSource[];
  /** Metadata displayed on the native playback UI. */
  metadata?: VideoMetadata;
}

// ===========================================================================
// DIRECTIVES
// ===========================================================================

/**
 * Instructs the device to play a video in full-screen native mode.
 * The video takes over the entire screen (not rendered inside APL).
 *
 * Requirements:
 *   - Device must support the VideoApp interface
 *   - Video URLs must be HTTPS
 *   - Response must not include `shouldEndSession` (video keeps session open)
 */
export interface VideoAppLaunchDirective extends Directive {
  type: "VideoApp.Launch";
  /** The video item to play. */
  videoItem: VideoItem;
}

// ===========================================================================
// REQUESTS (incoming from device to skill)
// ===========================================================================

/**
 * Sent when video playback starts on the device.
 */
export interface VideoAppPlaybackStartedRequest extends Request {
  type: "VideoApp.PlaybackStarted";
  /** The offset in the video when playback started, in milliseconds. */
  offsetInMilliseconds: number;
  /** A token that identifies the video currently playing. */
  token?: string;
}

/**
 * Sent when video playback completes naturally (reaches end of stream).
 */
export interface VideoAppPlaybackFinishedRequest extends Request {
  type: "VideoApp.PlaybackFinished";
  /** The offset in the video when playback finished, in milliseconds. */
  offsetInMilliseconds: number;
  /** A token that identifies the video that finished. */
  token?: string;
}

/**
 * Sent when video playback is stopped by the user (e.g., they navigate
 * away or say "Alexa, stop"). The offset can be used to resume later.
 */
export interface VideoAppPlaybackStoppedRequest extends Request {
  type: "VideoApp.PlaybackStopped";
  /** The offset in the video when playback was stopped, in milliseconds. */
  offsetInMilliseconds: number;
  /** A token that identifies the video that was stopped. */
  token?: string;
}

/**
 * Sent when the device encounters an error playing the video.
 */
export interface VideoAppPlaybackFailedRequest extends Request {
  type: "VideoApp.PlaybackFailed";
  /** The offset in the video when the error occurred, in milliseconds. */
  offsetInMilliseconds?: number;
  /** A token that identifies the video that failed. */
  token?: string;
  /** Error details from the device. */
  error: VideoAppPlaybackError;
}

/**
 * Error information reported when video playback fails.
 */
export interface VideoAppPlaybackError {
  /** The error type classification. */
  type: VideoAppErrorType;
  /** A human-readable error message from the device. */
  message: string;
}

/**
 * Possible error types for video playback failures.
 */
export type VideoAppErrorType =
  | "MEDIA_ERROR_UNKNOWN"
  | "MEDIA_ERROR_INVALID_REQUEST"
  | "MEDIA_ERROR_SERVICE_UNAVAILABLE"
  | "MEDIA_ERROR_INTERNAL_SERVER_ERROR"
  | "MEDIA_ERROR_INTERNAL_DEVICE_ERROR";
