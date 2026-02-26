/**
 * APL Request Router.
 *
 * Provides a routing framework for dispatching incoming Alexa requests
 * to the appropriate APL interface handlers. Supports all APL request types:
 *
 * - Alexa.Presentation.APL: UserEvent, LoadIndexListData, LoadTokenListData, RuntimeError
 * - Alexa.Presentation.APLA: RuntimeError
 * - AudioPlayer: PlaybackStarted, PlaybackFinished, PlaybackStopped, PlaybackNearlyFinished, PlaybackFailed
 * - VideoApp: PlaybackStarted, PlaybackFinished, PlaybackStopped, PlaybackFailed
 * - Alexa.DataStore: DataStoreError
 * - Alexa.DataStore.PackageManager: UsagesInstalled, UsagesRemoved, UpdateRequest, InstallationError
 */

import {
  AlexaSkillRequest,
  AlexaSkillResponse,
  Request,
} from "../types/common";
import {
  APLUserEventRequest,
  APLLoadIndexListDataRequest,
  APLLoadTokenListDataRequest,
  APLRuntimeErrorRequest,
} from "../types/apl";
import { APLARuntimeErrorRequest } from "../types/apla";
import {
  AudioPlayerPlaybackStartedRequest,
  AudioPlayerPlaybackFinishedRequest,
  AudioPlayerPlaybackStoppedRequest,
  AudioPlayerPlaybackNearlyFinishedRequest,
  AudioPlayerPlaybackFailedRequest,
} from "../types/audioplayer";
import {
  VideoAppPlaybackStartedRequest,
  VideoAppPlaybackFinishedRequest,
  VideoAppPlaybackStoppedRequest,
  VideoAppPlaybackFailedRequest,
} from "../types/videoapp";
import { DataStoreErrorRequest } from "../types/datastore";
import {
  UsagesInstalledRequest,
  UsagesRemovedRequest,
  UpdateRequestRequest,
  InstallationErrorRequest,
} from "../types/package-manager";

// ===========================================================================
// Handler callback types
// ===========================================================================

export type RequestHandlerCallback<T extends Request> = (
  request: T,
  fullRequest: AlexaSkillRequest,
) => AlexaSkillResponse | Promise<AlexaSkillResponse>;

export type NotificationHandlerCallback<T extends Request> = (
  request: T,
  fullRequest: AlexaSkillRequest,
) => void | Promise<void>;

// ===========================================================================
// Router configuration
// ===========================================================================

export interface APLRouterConfig {
  // Alexa.Presentation.APL handlers
  onUserEvent?: RequestHandlerCallback<APLUserEventRequest>;
  onLoadIndexListData?: RequestHandlerCallback<APLLoadIndexListDataRequest>;
  onLoadTokenListData?: RequestHandlerCallback<APLLoadTokenListDataRequest>;
  onAPLRuntimeError?: NotificationHandlerCallback<APLRuntimeErrorRequest>;

  // Alexa.Presentation.APLA handlers
  onAPLARuntimeError?: NotificationHandlerCallback<APLARuntimeErrorRequest>;

  // AudioPlayer handlers
  onAudioPlaybackStarted?: NotificationHandlerCallback<AudioPlayerPlaybackStartedRequest>;
  onAudioPlaybackFinished?: NotificationHandlerCallback<AudioPlayerPlaybackFinishedRequest>;
  onAudioPlaybackStopped?: NotificationHandlerCallback<AudioPlayerPlaybackStoppedRequest>;
  onAudioPlaybackNearlyFinished?: RequestHandlerCallback<AudioPlayerPlaybackNearlyFinishedRequest>;
  onAudioPlaybackFailed?: NotificationHandlerCallback<AudioPlayerPlaybackFailedRequest>;
  // VideoApp handlers
  onVideoPlaybackStarted?: NotificationHandlerCallback<VideoAppPlaybackStartedRequest>;
  onVideoPlaybackFinished?: NotificationHandlerCallback<VideoAppPlaybackFinishedRequest>;
  onVideoPlaybackStopped?: NotificationHandlerCallback<VideoAppPlaybackStoppedRequest>;
  onVideoPlaybackFailed?: NotificationHandlerCallback<VideoAppPlaybackFailedRequest>;

  // Alexa.DataStore handlers
  onDataStoreError?: NotificationHandlerCallback<DataStoreErrorRequest>;

  // Alexa.DataStore.PackageManager handlers
  onUsagesInstalled?: RequestHandlerCallback<UsagesInstalledRequest>;
  onUsagesRemoved?: RequestHandlerCallback<UsagesRemovedRequest>;
  onUpdateRequest?: RequestHandlerCallback<UpdateRequestRequest>;
  onInstallationError?: NotificationHandlerCallback<InstallationErrorRequest>;

  // Fallback handler for unrecognized APL request types
  onUnhandled?: RequestHandlerCallback<Request>;
}

// ===========================================================================
// APL Request Router
// ===========================================================================

/**
 * Routes incoming APL-related requests to the appropriate handler.
 *
 * Usage:
 * ```typescript
 * const router = new APLRequestRouter({
 *   onUserEvent: (request, fullRequest) => {
 *     // Handle user event
 *     return createAPLResponse({ speech: 'Got it!' });
 *   },
 *   onLoadIndexListData: (request, fullRequest) => {
 *     // Return next set of list items
 *     return createDirectiveOnlyResponse([sendIndexListDataDirective]);
 *   },
 * });
 *
 * // In your skill handler:
 * if (router.canHandle(alexaRequest)) {
 *   return router.handle(alexaRequest);
 * }
 * ```
 */
export class APLRequestRouter {
  private config: APLRouterConfig;

  constructor(config: APLRouterConfig) {
    this.config = config;
  }

  /**
   * All APL request types this router can handle.
   */
  private static readonly APL_REQUEST_TYPES = new Set([
    "Alexa.Presentation.APL.UserEvent",
    "Alexa.Presentation.APL.LoadIndexListData",
    "Alexa.Presentation.APL.LoadTokenListData",
    "Alexa.Presentation.APL.RuntimeError",
    "Alexa.Presentation.APLA.RuntimeError",
    "AudioPlayer.PlaybackStarted",
    "AudioPlayer.PlaybackFinished",
    "AudioPlayer.PlaybackStopped",
    "AudioPlayer.PlaybackNearlyFinished",
    "AudioPlayer.PlaybackFailed",
    "VideoApp.PlaybackStarted",
    "VideoApp.PlaybackFinished",
    "VideoApp.PlaybackStopped",
    "VideoApp.PlaybackFailed",
    "Alexa.DataStore.DataStoreError",
    "Alexa.DataStore.Error", // Alternative form used in doc JSON examples
    "Alexa.DataStore.PackageManager.UsagesInstalled",
    "Alexa.DataStore.PackageManager.UsagesRemoved",
    "Alexa.DataStore.PackageManager.UpdateRequest",
    "Alexa.DataStore.PackageManager.InstallationError",
  ]);

  /**
   * Check if this router can handle the given request.
   */
  canHandle(alexaRequest: AlexaSkillRequest): boolean {
    return APLRequestRouter.APL_REQUEST_TYPES.has(alexaRequest.request.type);
  }

  /**
   * Route the request to the appropriate handler.
   * @throws Error if no handler is registered for the request type.
   */
  async handle(alexaRequest: AlexaSkillRequest): Promise<AlexaSkillResponse> {
    const request = alexaRequest.request;
    const requestType = request.type;

    switch (requestType) {
      case "Alexa.Presentation.APL.UserEvent":
        if (this.config.onUserEvent) {
          return this.config.onUserEvent(
            request as APLUserEventRequest,
            alexaRequest,
          );
        }
        break;

      case "Alexa.Presentation.APL.LoadIndexListData":
        if (this.config.onLoadIndexListData) {
          return this.config.onLoadIndexListData(
            request as APLLoadIndexListDataRequest,
            alexaRequest,
          );
        }
        break;

      case "Alexa.Presentation.APL.LoadTokenListData":
        if (this.config.onLoadTokenListData) {
          return this.config.onLoadTokenListData(
            request as APLLoadTokenListDataRequest,
            alexaRequest,
          );
        }
        break;

      case "Alexa.Presentation.APL.RuntimeError":
        if (this.config.onAPLRuntimeError) {
          await this.config.onAPLRuntimeError(
            request as APLRuntimeErrorRequest,
            alexaRequest,
          );
        }
        return this.emptyResponse();

      case "Alexa.Presentation.APLA.RuntimeError":
        if (this.config.onAPLARuntimeError) {
          await this.config.onAPLARuntimeError(
            request as APLARuntimeErrorRequest,
            alexaRequest,
          );
        }
        return this.emptyResponse();

      case "AudioPlayer.PlaybackStarted":
        if (this.config.onAudioPlaybackStarted) {
          await this.config.onAudioPlaybackStarted(
            request as AudioPlayerPlaybackStartedRequest,
      case "VideoApp.PlaybackStarted":
        if (this.config.onVideoPlaybackStarted) {
          await this.config.onVideoPlaybackStarted(
            request as VideoAppPlaybackStartedRequest,
            alexaRequest,
          );
        }
        return this.emptyResponse();

      case "AudioPlayer.PlaybackFinished":
        if (this.config.onAudioPlaybackFinished) {
          await this.config.onAudioPlaybackFinished(
            request as AudioPlayerPlaybackFinishedRequest,
      case "VideoApp.PlaybackFinished":
        if (this.config.onVideoPlaybackFinished) {
          await this.config.onVideoPlaybackFinished(
            request as VideoAppPlaybackFinishedRequest,
            alexaRequest,
          );
        }
        return this.emptyResponse();

      case "AudioPlayer.PlaybackStopped":
        if (this.config.onAudioPlaybackStopped) {
          await this.config.onAudioPlaybackStopped(
            request as AudioPlayerPlaybackStoppedRequest,
      case "VideoApp.PlaybackStopped":
        if (this.config.onVideoPlaybackStopped) {
          await this.config.onVideoPlaybackStopped(
            request as VideoAppPlaybackStoppedRequest,
            alexaRequest,
          );
        }
        return this.emptyResponse();

      case "AudioPlayer.PlaybackNearlyFinished":
        if (this.config.onAudioPlaybackNearlyFinished) {
          return this.config.onAudioPlaybackNearlyFinished(
            request as AudioPlayerPlaybackNearlyFinishedRequest,
            alexaRequest,
          );
        }
        return this.emptyResponse();

      case "AudioPlayer.PlaybackFailed":
        if (this.config.onAudioPlaybackFailed) {
          await this.config.onAudioPlaybackFailed(
            request as AudioPlayerPlaybackFailedRequest,
      case "VideoApp.PlaybackFailed":
        if (this.config.onVideoPlaybackFailed) {
          await this.config.onVideoPlaybackFailed(
            request as VideoAppPlaybackFailedRequest,
            alexaRequest,
          );
        }
        return this.emptyResponse();

      case "Alexa.DataStore.DataStoreError":
      case "Alexa.DataStore.Error":
        if (this.config.onDataStoreError) {
          await this.config.onDataStoreError(
            request as DataStoreErrorRequest,
            alexaRequest,
          );
        }
        return this.emptyResponse();

      case "Alexa.DataStore.PackageManager.UsagesInstalled":
        if (this.config.onUsagesInstalled) {
          return this.config.onUsagesInstalled(
            request as UsagesInstalledRequest,
            alexaRequest,
          );
        }
        break;

      case "Alexa.DataStore.PackageManager.UsagesRemoved":
        if (this.config.onUsagesRemoved) {
          return this.config.onUsagesRemoved(
            request as UsagesRemovedRequest,
            alexaRequest,
          );
        }
        break;

      case "Alexa.DataStore.PackageManager.UpdateRequest":
        if (this.config.onUpdateRequest) {
          return this.config.onUpdateRequest(
            request as UpdateRequestRequest,
            alexaRequest,
          );
        }
        break;

      case "Alexa.DataStore.PackageManager.InstallationError":
        if (this.config.onInstallationError) {
          await this.config.onInstallationError(
            request as InstallationErrorRequest,
            alexaRequest,
          );
        }
        return this.emptyResponse();
    }

    // Fallback
    if (this.config.onUnhandled) {
      return this.config.onUnhandled(request, alexaRequest);
    }

    return this.emptyResponse();
  }

  private emptyResponse(): AlexaSkillResponse {
    return {
      version: "1.0",
      response: {},
    };
  }
}

// ===========================================================================
// Convenience: check if a request is an APL request
// ===========================================================================

/**
 * Check if the given request is an APL-related or media interface request
 * type handled by this router.
 */
export function isAPLRequest(request: Request): boolean {
  return (
    request.type.startsWith("Alexa.Presentation.APL.") ||
    request.type.startsWith("Alexa.Presentation.APLA.") ||
    request.type.startsWith("Alexa.Presentation.APLT.") ||
    request.type.startsWith("AudioPlayer.") ||
    request.type.startsWith("VideoApp.") ||
    request.type.startsWith("Alexa.DataStore.")
  );
}
