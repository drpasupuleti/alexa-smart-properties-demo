/**
 * AudioPlayer Interface types.
 *
 * The AudioPlayer interface enables skills to stream long-form audio
 * content (music, podcasts, audiobooks, etc.) on all Alexa devices.
 * Unlike short-form SSML audio or APLA, the AudioPlayer interface
 * keeps the audio playing after the skill session ends, supports
 * queue management, and provides a full playback lifecycle.
 *
 * Directives (skill → device):
 *   - Play:       Start or enqueue an audio stream
 *   - Stop:       Stop the currently playing audio
 *   - ClearQueue: Clear the playback queue (optionally stop current)
 *
 * Requests (device → skill):
 *   - PlaybackStarted:        Audio began playing
 *   - PlaybackFinished:       Audio finished (reached end of stream)
 *   - PlaybackStopped:        Audio was stopped (user or system)
 *   - PlaybackNearlyFinished: Audio is almost done (queue next track)
 *   - PlaybackFailed:         Audio encountered an error
 */

import { Directive, Request } from "./common";

// ===========================================================================
// Enums / literal types
// ===========================================================================

/**
 * Controls how the Play directive interacts with the current queue.
 *
 * - REPLACE_ALL:      Stop current audio and replace the entire queue
 * - ENQUEUE:          Add to end of current queue
 * - REPLACE_ENQUEUED: Replace all queued items but keep current playing
 */
export type AudioPlayBehavior =
  | "REPLACE_ALL"
  | "ENQUEUE"
  | "REPLACE_ENQUEUED";

/**
 * Controls what happens when a ClearQueue directive is processed.
 *
 * - CLEAR_ENQUEUED: Clear the queue but keep the current stream playing
 * - CLEAR_ALL:      Clear the queue and stop the current stream
 */
export type AudioClearBehavior = "CLEAR_ENQUEUED" | "CLEAR_ALL";

/**
 * The current playback state of the AudioPlayer.
 */
export type AudioPlayerActivity =
  | "IDLE"
  | "PLAYING"
  | "PAUSED"
  | "BUFFER_UNDERRUN"
  | "FINISHED"
  | "STOPPED";

/**
 * Error type categories for audio playback failures.
 */
export type AudioPlayerErrorType =
  | "MEDIA_ERROR_UNKNOWN"
  | "MEDIA_ERROR_INVALID_REQUEST"
  | "MEDIA_ERROR_SERVICE_UNAVAILABLE"
  | "MEDIA_ERROR_INTERNAL_SERVER_ERROR"
  | "MEDIA_ERROR_INTERNAL_DEVICE_ERROR";

// ===========================================================================
// Audio stream / item types
// ===========================================================================

/**
 * Metadata about the audio stream for display on screen-capable devices.
 */
export interface AudioItemMetadata {
  /** The title of the audio (displayed on screen devices). */
  title?: string;
  /** The subtitle (e.g., artist name or podcast name). */
  subtitle?: string;
  /** Art to display during playback. */
  art?: AudioImageSource;
  /** Background image for screen devices. */
  backgroundImage?: AudioImageSource;
}

/**
 * An image source with multiple size options.
 */
export interface AudioImageSource {
  /** The content description for accessibility. */
  contentDescription?: string;
  /** Image URLs at various resolutions. */
  sources: AudioImageSourceItem[];
}

export interface AudioImageSourceItem {
  /** The URL of the image. Must be HTTPS. */
  url: string;
  /** Optional pixel width hint. */
  widthPixels?: number;
  /** Optional pixel height hint. */
  heightPixels?: number;
  /** The size category. */
  size?: "X_SMALL" | "SMALL" | "MEDIUM" | "LARGE" | "X_LARGE";
}

/**
 * Represents the audio stream to play.
 */
export interface AudioStream {
  /** The URL of the audio stream. Must be HTTPS. */
  url: string;
  /**
   * An opaque token that uniquely identifies this audio stream.
   * Used to correlate playback requests back to a specific stream.
   */
  token: string;
  /**
   * The token of the audio stream expected to be playing when this
   * item starts. Required when playBehavior is ENQUEUE.
   */
  expectedPreviousToken?: string;
  /** The offset in milliseconds to begin playback from. */
  offsetInMilliseconds: number;
}

/**
 * An audio item combining a stream with optional display metadata.
 */
export interface AudioItem {
  /** The audio stream to play. */
  stream: AudioStream;
  /** Optional metadata for display on screen devices. */
  metadata?: AudioItemMetadata;
}

// ===========================================================================
// Error types
// ===========================================================================

/**
 * Error details reported when audio playback fails.
 */
export interface AudioPlayerError {
  /** The error type classification. */
  type: AudioPlayerErrorType;
  /** A human-readable error message. */
  message: string;
}

/**
 * The stream that was playing when the error occurred.
 */
export interface AudioPlayerCurrentPlaybackState {
  /** The token of the stream that was playing. */
  token: string;
  /** The offset in milliseconds when the error occurred. */
  offsetInMilliseconds: number;
  /** The player activity at the time of the error. */
  playerActivity: AudioPlayerActivity;
}

// ===========================================================================
// DIRECTIVES
// ===========================================================================

/**
 * Sends an audio stream to the device for playback.
 * The playBehavior determines how the stream interacts with the queue.
 */
export interface AudioPlayerPlayDirective extends Directive {
  type: "AudioPlayer.Play";
  /** How this stream interacts with the current queue. */
  playBehavior: AudioPlayBehavior;
  /** The audio item to play. */
  audioItem: AudioItem;
}

/**
 * Stops the currently playing audio stream.
 */
export interface AudioPlayerStopDirective extends Directive {
  type: "AudioPlayer.Stop";
}

/**
 * Clears the audio playback queue.
 * Behavior depends on clearBehavior.
 */
export interface AudioPlayerClearQueueDirective extends Directive {
  type: "AudioPlayer.ClearQueue";
  /** What to clear: queue only, or queue and current stream. */
  clearBehavior: AudioClearBehavior;
}

// ===========================================================================
// REQUESTS (incoming from device to skill)
// ===========================================================================

/**
 * Sent when the device begins playing an audio stream.
 */
export interface AudioPlayerPlaybackStartedRequest extends Request {
  type: "AudioPlayer.PlaybackStarted";
  /** The token of the stream that started playing. */
  token: string;
  /** The offset in milliseconds when playback started. */
  offsetInMilliseconds: number;
}

/**
 * Sent when the audio stream finishes playing (reached end of stream).
 */
export interface AudioPlayerPlaybackFinishedRequest extends Request {
  type: "AudioPlayer.PlaybackFinished";
  /** The token of the stream that finished. */
  token: string;
  /** The offset in milliseconds when playback finished. */
  offsetInMilliseconds: number;
}

/**
 * Sent when audio playback is stopped. This happens when:
 * - The skill sends a Stop directive
 * - The user says "Alexa, stop"
 * - The user starts a different skill or activity
 */
export interface AudioPlayerPlaybackStoppedRequest extends Request {
  type: "AudioPlayer.PlaybackStopped";
  /** The token of the stream that was stopped. */
  token: string;
  /** The offset in milliseconds when playback stopped (for resume). */
  offsetInMilliseconds: number;
}

/**
 * Sent when the current audio stream is nearly finished.
 * This is the signal to enqueue the next track. Respond with
 * a Play directive using ENQUEUE behavior.
 */
export interface AudioPlayerPlaybackNearlyFinishedRequest extends Request {
  type: "AudioPlayer.PlaybackNearlyFinished";
  /** The token of the stream that is nearly finished. */
  token: string;
  /** The current offset in milliseconds. */
  offsetInMilliseconds: number;
}

/**
 * Sent when the device encounters an error playing the audio stream.
 */
export interface AudioPlayerPlaybackFailedRequest extends Request {
  type: "AudioPlayer.PlaybackFailed";
  /** The token of the stream that was being played. */
  token: string;
  /** Error details. */
  error: AudioPlayerError;
  /** The state of the player when the error occurred. */
  currentPlaybackState: AudioPlayerCurrentPlaybackState;
}
