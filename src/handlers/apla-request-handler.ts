/**
 * Alexa.Presentation.APLA Request Handlers.
 *
 * Handles incoming requests from the APLA interface:
 *   - RuntimeError: An error occurred during APL audio processing
 *
 * @deprecated APLA request handlers are deprecated. Use APLT instead.
 */

import { Request, AlexaSkillRequest } from "../types/common";
import {
  APLARuntimeErrorRequest,
  APLARuntimeError,
  APLARuntimeErrorType,
  APLARuntimeErrorReason,
} from "../types/apla";

// ===========================================================================
// Handler interfaces
// ===========================================================================

/**
 * Handler for APLA RuntimeError requests.
 * Sent to notify the skill about any errors that happened during
 * APL audio processing. This request is for notification only —
 * the skill can't return a response.
 * @deprecated Use APLT instead.
 */
export interface APLARuntimeErrorHandler {
  canHandle(request: APLARuntimeErrorRequest): boolean;
  handle(
    request: APLARuntimeErrorRequest,
    fullRequest: AlexaSkillRequest,
  ): void | Promise<void>;
}

// ===========================================================================
// Request type guards
// ===========================================================================

/** @deprecated Use APLT instead. */
export function isAPLARuntimeError(
  request: Request,
): request is APLARuntimeErrorRequest {
  return request.type === "Alexa.Presentation.APLA.RuntimeError";
}

// ===========================================================================
// Request data extraction utilities
// ===========================================================================

/**
 * Extract the errors from an APLA RuntimeError request.
 * @deprecated Use APLT instead.
 */
export function getAPLARuntimeErrors(
  request: APLARuntimeErrorRequest,
): APLARuntimeError[] {
  return request.errors;
}

/**
 * Check if an error is a render error.
 */
export function isRenderError(error: APLARuntimeError): boolean {
  return error.type === "RENDER_ERROR";
}

/**
 * Check if an error is a link error (e.g. linked document not found).
 */
export function isLinkError(error: APLARuntimeError): boolean {
  return error.type === "LINK_ERROR";
}

/**
 * Check if an error is a "not found" error (linked document was not found).
 * This typically means the document.src is invalid or the skill needs
 * to be rebuilt to make the document available.
 */
export function isNotFoundError(error: APLARuntimeError): boolean {
  return error.type === "LINK_ERROR" && error.reason === "NOT_FOUND_ERROR";
}

// Re-export types for convenience
export type { APLARuntimeErrorType, APLARuntimeErrorReason };
