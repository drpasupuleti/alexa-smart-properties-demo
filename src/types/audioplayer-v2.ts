/**
 * AudioPlayer V2 Interface types.
 *
 * Extends the AudioPlayer interface with SkipTo and ReplayFrom directives
 * that allow skill builders to jump to or replay from a specific time
 * position in the currently playing audio stream.
 */

import { Directive } from "./common";

/**
 * Instructs the device to jump playback to a specific time position.
 */
export interface AudioPlayerV2SkipToDirective extends Directive {
  type: "AudioPlayerV2.SkipTo";
  /** Absolute target time position in milliseconds. */
  offsetInMilliseconds: number;
  /** Token identifying the audio stream to apply the skip to. */
  token: string;
}

/**
 * Instructs the device to replay the current audio stream from a specific position.
 */
export interface AudioPlayerV2ReplayFromDirective extends Directive {
  type: "AudioPlayerV2.ReplayFrom";
  /** Absolute time position in milliseconds to replay from. */
  offsetInMilliseconds: number;
  /** Token identifying the audio stream to replay. */
  token: string;
}
