/**
 * Alexa.Presentation.HTML Request Handlers.
 *
 * Handles incoming requests from the HTML interface:
 *   - Message: Web app sent a message to the skill via sendMessage()
 */

import {
  Request,
  AlexaSkillRequest,
  AlexaSkillResponse,
} from "../types/common";
import { HTMLMessageRequest } from "../types/html";

// ===========================================================================
// Handler interfaces
// ===========================================================================

/**
 * Handler for HTML Message requests.
 * Invoked when the web app sends a message to the skill backend
 * via the Alexa HTML SDK's `sendMessage()` method.
 */
export interface HTMLMessageHandler {
  /**
   * Determines whether this handler can handle the given request.
   */
  canHandle(request: HTMLMessageRequest): boolean;

  /**
   * Handles the Message request and returns a response.
   * The response can include a HandleMessage directive to reply
   * to the web app.
   */
  handle(
    request: HTMLMessageRequest,
    fullRequest: AlexaSkillRequest,
  ): AlexaSkillResponse | Promise<AlexaSkillResponse>;
}

// ===========================================================================
// Request type guards
// ===========================================================================

/**
 * Check if a request is an HTML Message request.
 */
export function isHTMLMessage(
  request: Request,
): request is HTMLMessageRequest {
  return request.type === "Alexa.Presentation.HTML.Message";
}

// ===========================================================================
// Request data extraction utilities
// ===========================================================================

/**
 * Extract the message payload from an HTML Message request.
 */
export function getHTMLMessage(
  request: HTMLMessageRequest,
): Record<string, unknown> {
  return request.message;
}

/**
 * Extract a typed value from the message payload.
 * Returns undefined if the key does not exist.
 *
 * @example
 * ```typescript
 * const action = getHTMLMessageField<string>(request, "action");
 * const score = getHTMLMessageField<number>(request, "score");
 * ```
 */
export function getHTMLMessageField<T = unknown>(
  request: HTMLMessageRequest,
  key: string,
): T | undefined {
  return request.message[key] as T | undefined;
}

// ===========================================================================
// Device support detection
// ===========================================================================

/**
 * Check if the device supports the HTML interface.
 * This should be checked before sending HTML directives.
 */
export function supportsHTML(request: AlexaSkillRequest): boolean {
  const interfaces =
    request.context.System.device.supportedInterfaces;
  return "Alexa.Presentation.HTML" in interfaces;
}
