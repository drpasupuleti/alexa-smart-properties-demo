/**
 * AudioPlayer V2 directive builders.
 *
 * Provides builder classes and factory functions for constructing the
 * two AudioPlayer V2 directives: SkipTo and ReplayFrom.
 *
 * The AudioPlayer V2 interface extends V1 with playback position control,
 * allowing skills to jump to or replay from a specific time position
 * in the currently playing audio stream.
 */

import {
  AudioPlayerV2SkipToDirective,
  AudioPlayerV2ReplayFromDirective,
} from "../types/audioplayer-v2";

// ===========================================================================
// SkipTo directive builder
// ===========================================================================

export class AudioPlayerV2SkipToDirectiveBuilder {
  private token?: string;
  private offsetInMilliseconds: number = 0;

  /**
   * Set the opaque token identifying the audio stream to skip within.
   */
  setToken(token: string): this {
    this.token = token;
    return this;
  }

  /**
   * Set the absolute target time position in milliseconds.
   */
  setOffsetInMilliseconds(offset: number): this {
    this.offsetInMilliseconds = offset;
    return this;
  }

  /**
   * Build and return the AudioPlayerV2.SkipTo directive.
   * @throws Error if token is not set or offset is negative.
   */
  build(): AudioPlayerV2SkipToDirective {
    if (!this.token) {
      throw new Error(
        "AudioPlayerV2.SkipTo requires a token. Call setToken() first.",
      );
    }
    if (this.offsetInMilliseconds < 0) {
      throw new Error(
        `offsetInMilliseconds must be non-negative (got ${this.offsetInMilliseconds})`,
      );
    }

    return {
      type: "AudioPlayerV2.SkipTo",
      token: this.token,
      offsetInMilliseconds: this.offsetInMilliseconds,
    };
  }
}


// ===========================================================================
// ReplayFrom directive builder
// ===========================================================================

export class AudioPlayerV2ReplayFromDirectiveBuilder {
  private token?: string;
  private offsetInMilliseconds: number = 0;

  /**
   * Set the opaque token identifying the audio stream to replay.
   */
  setToken(token: string): this {
    this.token = token;
    return this;
  }

  /**
   * Set the absolute time position in milliseconds to replay from.
   */
  setOffsetInMilliseconds(offset: number): this {
    this.offsetInMilliseconds = offset;
    return this;
  }

  /**
   * Build and return the AudioPlayerV2.ReplayFrom directive.
   * @throws Error if token is not set or offset is negative.
   */
  build(): AudioPlayerV2ReplayFromDirective {
    if (!this.token) {
      throw new Error(
        "AudioPlayerV2.ReplayFrom requires a token. Call setToken() first.",
      );
    }
    if (this.offsetInMilliseconds < 0) {
      throw new Error(
        `offsetInMilliseconds must be non-negative (got ${this.offsetInMilliseconds})`,
      );
    }

    return {
      type: "AudioPlayerV2.ReplayFrom",
      token: this.token,
      offsetInMilliseconds: this.offsetInMilliseconds,
    };
  }
}

// ===========================================================================
// Convenience factory functions
// ===========================================================================

/**
 * Create an AudioPlayerV2.SkipTo directive.
 *
 * @param token - Token identifying the audio stream.
 * @param offsetInMilliseconds - Absolute target time position in milliseconds.
 * @throws Error if token is empty or offset is negative.
 */
export function createAudioPlayerV2SkipToDirective(
  token: string,
  offsetInMilliseconds: number,
): AudioPlayerV2SkipToDirective {
  return new AudioPlayerV2SkipToDirectiveBuilder()
    .setToken(token)
    .setOffsetInMilliseconds(offsetInMilliseconds)
    .build();
}

/**
 * Create an AudioPlayerV2.ReplayFrom directive.
 *
 * @param token - Token identifying the audio stream.
 * @param offsetInMilliseconds - Absolute time position in milliseconds to replay from.
 * @throws Error if token is empty or offset is negative.
 */
export function createAudioPlayerV2ReplayFromDirective(
  token: string,
  offsetInMilliseconds: number,
): AudioPlayerV2ReplayFromDirective {
  return new AudioPlayerV2ReplayFromDirectiveBuilder()
    .setToken(token)
    .setOffsetInMilliseconds(offsetInMilliseconds)
    .build();
}

// ===========================================================================
// Time conversion helpers
// ===========================================================================

/**
 * Convert seconds to milliseconds.
 * @throws Error if the value is negative.
 */
export function secondsToMilliseconds(seconds: number): number {
  if (seconds < 0) {
    throw new Error(`seconds must be non-negative (got ${seconds})`);
  }
  return seconds * 1000;
}

/**
 * Convert minutes to milliseconds.
 * @throws Error if the value is negative.
 */
export function minutesToMilliseconds(minutes: number): number {
  if (minutes < 0) {
    throw new Error(`minutes must be non-negative (got ${minutes})`);
  }
  return minutes * 60000;
}
