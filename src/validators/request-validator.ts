/**
 * Request Validator.
 *
 * Provides utilities for validating incoming Alexa skill requests,
 * including timestamp freshness checks to guard against replay attacks.
 *
 * The Alexa service includes an ISO 8601 timestamp in every request.
 * Skills should verify that the request is recent to prevent replayed
 * requests from being processed. The Alexa documentation recommends
 * a tolerance of 150 seconds.
 */

import { AlexaSkillRequest, Request } from "../types/common";

// ===========================================================================
// Constants
// ===========================================================================

/**
 * Default maximum age for a request timestamp, in seconds.
 * Matches the Alexa-recommended tolerance of 150 seconds (2.5 minutes).
 */
export const DEFAULT_MAX_REQUEST_AGE_SECONDS = 150;

// ===========================================================================
// Timestamp validation
// ===========================================================================

/**
 * Options for request timestamp validation.
 */
export interface TimestampValidationOptions {
  /**
   * Maximum allowed age of the request in seconds.
   * Defaults to `DEFAULT_MAX_REQUEST_AGE_SECONDS` (150 seconds).
   */
  maxAgeSeconds?: number;

  /**
   * The current time to compare against. Defaults to `new Date()`.
   * Useful for testing.
   */
  now?: Date;
}

/**
 * Result of a request timestamp validation.
 */
export interface TimestampValidationResult {
  /** Whether the timestamp is valid (present, parseable, and within tolerance). */
  valid: boolean;
  /** The parsed timestamp as a Date object, if parseable. */
  timestamp?: Date;
  /** The age of the request in seconds, if the timestamp is parseable. */
  ageSeconds?: number;
  /** Error message if validation failed. */
  error?: string;
}

/**
 * Validate the timestamp on an Alexa skill request.
 *
 * Checks that:
 * 1. The `timestamp` field is present on the request
 * 2. The timestamp is a valid ISO 8601 date string
 * 3. The request is not older than `maxAgeSeconds` (default: 150s)
 * 4. The request is not from the future (with a small tolerance)
 *
 * @example
 * ```typescript
 * const result = validateRequestTimestamp(alexaRequest);
 * if (!result.valid) {
 *   console.error(`Stale request: ${result.error}`);
 *   // Return an error response or reject the request
 * }
 * ```
 */
export function validateRequestTimestamp(
  alexaRequest: AlexaSkillRequest,
  options?: TimestampValidationOptions,
): TimestampValidationResult {
  const maxAge = options?.maxAgeSeconds ?? DEFAULT_MAX_REQUEST_AGE_SECONDS;
  const now = options?.now ?? new Date();

  const request = alexaRequest.request;

  if (!request.timestamp) {
    return {
      valid: false,
      error: "Request timestamp is missing",
    };
  }

  const timestamp = new Date(request.timestamp);

  if (isNaN(timestamp.getTime())) {
    return {
      valid: false,
      error: `Request timestamp is not a valid date: "${request.timestamp}"`,
    };
  }

  const ageMs = now.getTime() - timestamp.getTime();
  const ageSeconds = Math.floor(ageMs / 1000);

  // Allow a small future tolerance (5 seconds) for clock skew
  if (ageMs < -5000) {
    return {
      valid: false,
      timestamp,
      ageSeconds,
      error:
        `Request timestamp is in the future by ${Math.abs(ageSeconds)} seconds`,
    };
  }

  if (ageSeconds > maxAge) {
    return {
      valid: false,
      timestamp,
      ageSeconds,
      error:
        `Request is too old: ${ageSeconds} seconds (max: ${maxAge} seconds)`,
    };
  }

  return {
    valid: true,
    timestamp,
    ageSeconds,
  };
}

/**
 * Check if a request timestamp is fresh (within the allowed age).
 * Convenience function that returns a boolean instead of a full result.
 *
 * @example
 * ```typescript
 * if (!isRequestFresh(alexaRequest)) {
 *   return createAPLResponse({ speech: "Request expired. Please try again." });
 * }
 * ```
 */
export function isRequestFresh(
  alexaRequest: AlexaSkillRequest,
  options?: TimestampValidationOptions,
): boolean {
  return validateRequestTimestamp(alexaRequest, options).valid;
}

/**
 * Get the age of a request in seconds.
 * Returns undefined if the timestamp is missing or unparseable.
 */
export function getRequestAgeSeconds(
  alexaRequest: AlexaSkillRequest,
  now?: Date,
): number | undefined {
  const request = alexaRequest.request;

  if (!request.timestamp) {
    return undefined;
  }

  const timestamp = new Date(request.timestamp);
  if (isNaN(timestamp.getTime())) {
    return undefined;
  }

  return Math.floor(((now ?? new Date()).getTime() - timestamp.getTime()) / 1000);
}

/**
 * Parse the request timestamp into a Date object.
 * Returns undefined if the timestamp is missing or unparseable.
 */
export function getRequestTimestamp(
  alexaRequest: AlexaSkillRequest,
): Date | undefined {
  const request = alexaRequest.request;

  if (!request.timestamp) {
    return undefined;
  }

  const timestamp = new Date(request.timestamp);
  if (isNaN(timestamp.getTime())) {
    return undefined;
  }

  return timestamp;
}
