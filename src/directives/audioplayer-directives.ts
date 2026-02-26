/**
 * AudioPlayer directive builders.
 *
 * Provides builder classes and factory functions for constructing the
 * three AudioPlayer directives: Play, Stop, and ClearQueue.
 *
 * The AudioPlayer interface is the primary way skills stream long-form
 * audio content (music, podcasts, audiobooks) on all Alexa devices.
 */

import {
  AudioPlayerPlayDirective,
  AudioPlayerStopDirective,
  AudioPlayerClearQueueDirective,
  AudioPlayBehavior,
  AudioClearBehavior,
  AudioItem,
  AudioStream,
  AudioItemMetadata,
  AudioImageSource,
} from "../types/audioplayer";

// ===========================================================================
// Play directive builder
// ===========================================================================

export class AudioPlayerPlayDirectiveBuilder {
  private playBehavior: AudioPlayBehavior = "REPLACE_ALL";
  private url: string = "";
  private token: string = "";
  private offsetInMilliseconds: number = 0;
  private expectedPreviousToken?: string;
  private metadata?: AudioItemMetadata;

  /**
   * Set the play behavior.
   *
   * - REPLACE_ALL:      Stop current audio and replace the entire queue
   * - ENQUEUE:          Add to end of current queue
   * - REPLACE_ENQUEUED: Replace all queued items but keep current playing
   */
  setPlayBehavior(behavior: AudioPlayBehavior): this {
    this.playBehavior = behavior;
    return this;
  }

  /**
   * Set the audio stream URL. Must be HTTPS.
   * @throws Error if the URL does not use HTTPS.
   */
  setUrl(url: string): this {
    if (!url || !url.startsWith("https://")) {
      throw new Error(
        `AudioPlayer stream URL must use HTTPS (got "${url || ""}")`,
      );
    }
    this.url = url;
    return this;
  }

  /**
   * Set the opaque token that uniquely identifies this stream.
   * This token is returned in all subsequent playback requests
   * so you can correlate events to the correct stream.
   */
  setToken(token: string): this {
    if (!token) {
      throw new Error("AudioPlayer stream token must not be empty");
    }
    this.token = token;
    return this;
  }

  /**
   * Set the offset to begin playback from, in milliseconds.
   * Use 0 to start from the beginning, or a saved offset to resume.
   * @throws Error if the offset is negative.
   */
  setOffsetInMilliseconds(offset: number): this {
    if (offset < 0) {
      throw new Error(
        `offsetInMilliseconds must be non-negative (got ${offset})`,
      );
    }
    this.offsetInMilliseconds = offset;
    return this;
  }

  /**
   * Set the expected previous token. Required when playBehavior is ENQUEUE.
   * This is the token of the stream that should be playing when this
   * new item starts.
   */
  setExpectedPreviousToken(token: string): this {
    this.expectedPreviousToken = token;
    return this;
  }

  /**
   * Set display metadata (title, subtitle, artwork) for screen devices.
   */
  setMetadata(metadata: AudioItemMetadata): this {
    this.metadata = { ...metadata };
    return this;
  }

  /**
   * Set the title displayed on screen devices.
   */
  setTitle(title: string): this {
    this.metadata = { ...this.metadata, title };
    return this;
  }

  /**
   * Set the subtitle displayed on screen devices.
   */
  setSubtitle(subtitle: string): this {
    this.metadata = { ...this.metadata, subtitle };
    return this;
  }

  /**
   * Set the artwork image for screen devices.
   */
  setArt(art: AudioImageSource): this {
    this.metadata = { ...this.metadata, art };
    return this;
  }

  /**
   * Set the background image for screen devices.
   */
  setBackgroundImage(backgroundImage: AudioImageSource): this {
    this.metadata = { ...this.metadata, backgroundImage };
    return this;
  }

  /**
   * Build and return the AudioPlayer.Play directive.
   * @throws Error if required properties are missing.
   */
  build(): AudioPlayerPlayDirective {
    if (!this.url) {
      throw new Error(
        "AudioPlayer.Play requires a stream URL. Call setUrl() first.",
      );
    }
    if (!this.token) {
      throw new Error(
        "AudioPlayer.Play requires a stream token. Call setToken() first.",
      );
    }
    if (this.playBehavior === "ENQUEUE" && !this.expectedPreviousToken) {
      throw new Error(
        'AudioPlayer.Play with ENQUEUE behavior requires expectedPreviousToken. ' +
          'Call setExpectedPreviousToken() first.',
      );
    }

    const stream: AudioStream = {
      url: this.url,
      token: this.token,
      offsetInMilliseconds: this.offsetInMilliseconds,
    };

    if (this.expectedPreviousToken) {
      stream.expectedPreviousToken = this.expectedPreviousToken;
    }

    const audioItem: AudioItem = { stream };

    if (this.metadata) {
      audioItem.metadata = { ...this.metadata };
    }

    return {
      type: "AudioPlayer.Play",
      playBehavior: this.playBehavior,
      audioItem,
    };
  }
}

// ===========================================================================
// Convenience factory functions
// ===========================================================================

/**
 * Create an AudioPlayer.Play directive to start playing audio.
 * Defaults to REPLACE_ALL behavior (stops current and replaces queue).
 *
 * @param url   - The HTTPS URL of the audio stream.
 * @param token - An opaque token to identify this stream.
 * @param options - Optional: offset, metadata, playBehavior, expectedPreviousToken.
 * @throws Error if URL is not HTTPS or token is empty.
 *
 * @example
 * ```typescript
 * // Play from the beginning
 * const play = createAudioPlayerPlayDirective(
 *   "https://example.com/podcast.mp3",
 *   "episode-42",
 *   { title: "Episode 42", subtitle: "My Podcast" },
 * );
 *
 * // Resume from a saved offset
 * const resume = createAudioPlayerPlayDirective(
 *   "https://example.com/podcast.mp3",
 *   "episode-42",
 *   { offsetInMilliseconds: 120000 },
 * );
 * ```
 */
export function createAudioPlayerPlayDirective(
  url: string,
  token: string,
  options?: {
    offsetInMilliseconds?: number;
    playBehavior?: AudioPlayBehavior;
    expectedPreviousToken?: string;
    title?: string;
    subtitle?: string;
    art?: AudioImageSource;
    backgroundImage?: AudioImageSource;
    metadata?: AudioItemMetadata;
  },
): AudioPlayerPlayDirective {
  const builder = new AudioPlayerPlayDirectiveBuilder()
    .setUrl(url)
    .setToken(token);

  if (options?.playBehavior) {
    builder.setPlayBehavior(options.playBehavior);
  }
  if (options?.offsetInMilliseconds !== undefined) {
    builder.setOffsetInMilliseconds(options.offsetInMilliseconds);
  }
  if (options?.expectedPreviousToken) {
    builder.setExpectedPreviousToken(options.expectedPreviousToken);
  }
  if (options?.metadata) {
    builder.setMetadata(options.metadata);
  }
  if (options?.title) {
    builder.setTitle(options.title);
  }
  if (options?.subtitle) {
    builder.setSubtitle(options.subtitle);
  }
  if (options?.art) {
    builder.setArt(options.art);
  }
  if (options?.backgroundImage) {
    builder.setBackgroundImage(options.backgroundImage);
  }

  return builder.build();
}

/**
 * Create an AudioPlayer.Play directive to enqueue the next track.
 * This is typically used in response to a PlaybackNearlyFinished request.
 *
 * @param url                    - The HTTPS URL of the next audio stream.
 * @param token                  - Token for the new stream.
 * @param expectedPreviousToken  - Token of the currently playing stream.
 * @param options                - Optional metadata and offset.
 */
export function createAudioPlayerEnqueueDirective(
  url: string,
  token: string,
  expectedPreviousToken: string,
  options?: {
    offsetInMilliseconds?: number;
    title?: string;
    subtitle?: string;
    metadata?: AudioItemMetadata;
  },
): AudioPlayerPlayDirective {
  return createAudioPlayerPlayDirective(url, token, {
    ...options,
    playBehavior: "ENQUEUE",
    expectedPreviousToken,
  });
}

/**
 * Create an AudioPlayer.Stop directive.
 */
export function createAudioPlayerStopDirective(): AudioPlayerStopDirective {
  return { type: "AudioPlayer.Stop" };
}

/**
 * Create an AudioPlayer.ClearQueue directive.
 *
 * @param clearBehavior - CLEAR_ENQUEUED (keep playing, clear queue)
 *                        or CLEAR_ALL (stop everything).
 */
export function createAudioPlayerClearQueueDirective(
  clearBehavior: AudioClearBehavior = "CLEAR_ALL",
): AudioPlayerClearQueueDirective {
  return {
    type: "AudioPlayer.ClearQueue",
    clearBehavior,
  };
}
