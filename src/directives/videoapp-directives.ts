/**
 * VideoApp directive builders.
 *
 * Provides factory functions and a builder class for constructing
 * VideoApp.Launch directives. The VideoApp interface enables skills
 * to play full-screen native video on screen-capable Alexa devices.
 */

import {
  VideoAppLaunchDirective,
  VideoItem,
  VideoSource,
  VideoMetadata,
} from "../types/videoapp";

// ===========================================================================
// Launch directive builder
// ===========================================================================

export class VideoAppLaunchDirectiveBuilder {
  private sources: VideoSource[] = [];
  private metadata?: VideoMetadata;

  /**
   * Add a video source URL. At least one source is required.
   * Multiple sources are tried in order until the device finds one
   * it can play.
   *
   * @param url - The HTTPS URL of the video stream.
   * @param options - Optional source properties (sizeInBytes, offsetInMilliseconds).
   * @throws Error if the URL does not use HTTPS.
   */
  addSource(
    url: string,
    options?: { sizeInBytes?: number; offsetInMilliseconds?: number },
  ): this {
    if (!url || !url.startsWith("https://")) {
      throw new Error(
        `VideoApp source URL must use HTTPS (got "${url || ""}")`,
      );
    }

    const source: VideoSource = { url };
    if (options?.sizeInBytes !== undefined) {
      if (options.sizeInBytes < 0) {
        throw new Error(
          `sizeInBytes must be non-negative (got ${options.sizeInBytes})`,
        );
      }
      source.sizeInBytes = options.sizeInBytes;
    }
    if (options?.offsetInMilliseconds !== undefined) {
      if (options.offsetInMilliseconds < 0) {
        throw new Error(
          `offsetInMilliseconds must be non-negative (got ${options.offsetInMilliseconds})`,
        );
      }
      source.offsetInMilliseconds = options.offsetInMilliseconds;
    }

    this.sources.push(source);
    return this;
  }

  /**
   * Set the video title displayed during playback.
   */
  setTitle(title: string): this {
    this.metadata = { ...this.metadata, title };
    return this;
  }

  /**
   * Set the video subtitle displayed during playback.
   */
  setSubtitle(subtitle: string): this {
    this.metadata = { ...this.metadata, subtitle };
    return this;
  }

  /**
   * Set the full metadata object for the video.
   */
  setMetadata(metadata: VideoMetadata): this {
    this.metadata = { ...metadata };
    return this;
  }

  /**
   * Build and return the VideoApp.Launch directive.
   * @throws Error if no sources have been added.
   */
  build(): VideoAppLaunchDirective {
    if (this.sources.length === 0) {
      throw new Error(
        "VideoApp.Launch requires at least one video source. " +
          "Call addSource() first.",
      );
    }

    const videoItem: VideoItem = {
      sources: [...this.sources],
    };

    if (this.metadata) {
      videoItem.metadata = { ...this.metadata };
    }

    return {
      type: "VideoApp.Launch",
      videoItem,
    };
  }
}

// ===========================================================================
// Convenience factory functions
// ===========================================================================

/**
 * Create a VideoApp.Launch directive from a single URL.
 *
 * For most use cases where you have a single video to play,
 * this is the simplest way to create the directive.
 *
 * @param url - The HTTPS URL of the video.
 * @param options - Optional metadata and offset for resuming playback.
 * @throws Error if the URL is not HTTPS.
 *
 * @example
 * ```typescript
 * const directive = createVideoAppLaunchDirective(
 *   "https://example.com/video.mp4",
 *   { title: "My Video", subtitle: "Episode 1" },
 * );
 * ```
 */
export function createVideoAppLaunchDirective(
  url: string,
  options?: {
    title?: string;
    subtitle?: string;
    offsetInMilliseconds?: number;
    sizeInBytes?: number;
  },
): VideoAppLaunchDirective {
  const builder = new VideoAppLaunchDirectiveBuilder().addSource(url, {
    sizeInBytes: options?.sizeInBytes,
    offsetInMilliseconds: options?.offsetInMilliseconds,
  });

  if (options?.title) {
    builder.setTitle(options.title);
  }
  if (options?.subtitle) {
    builder.setSubtitle(options.subtitle);
  }

  return builder.build();
}

/**
 * Create a VideoApp.Launch directive with multiple source URLs.
 *
 * The device tries each source in order until it finds one it can play.
 * Useful when you have multiple encodings or CDN fallbacks.
 *
 * @param sources - Array of video source objects.
 * @param metadata - Optional title and subtitle.
 * @throws Error if the sources array is empty or any URL is not HTTPS.
 */
export function createVideoAppLaunchDirectiveWithSources(
  sources: VideoSource[],
  metadata?: VideoMetadata,
): VideoAppLaunchDirective {
  if (!sources || sources.length === 0) {
    throw new Error("At least one video source is required");
  }

  const builder = new VideoAppLaunchDirectiveBuilder();

  for (const source of sources) {
    builder.addSource(source.url, {
      sizeInBytes: source.sizeInBytes,
      offsetInMilliseconds: source.offsetInMilliseconds,
    });
  }

  if (metadata) {
    builder.setMetadata(metadata);
  }

  return builder.build();
}
