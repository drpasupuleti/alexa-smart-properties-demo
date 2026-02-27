/**
 * AudioPlayer V2 Request Handlers.
 *
 * Provides type guards and device capability detection for the
 * AudioPlayer V2 interface (SkipTo, ReplayFrom directives).
 */

import { Request, AlexaSkillRequest } from "../types/common";

/**
 * Check if a request is any AudioPlayer V2 request.
 */
export function isAudioPlayerV2Request(request: Request): boolean {
  return request.type.startsWith("AudioPlayerV2.");
}

/**
 * Check if the device supports the AudioPlayer V2 interface.
 * Always check this before sending AudioPlayer V2 directives.
 */
export function supportsAudioPlayerV2(request: AlexaSkillRequest): boolean {
  const interfaces = request.context.System.device.supportedInterfaces;
  return "AudioPlayerV2" in interfaces;
}
