/**
 * Alexa.Presentation.APL Request Handlers.
 *
 * Handles incoming requests from the APL interface:
 *   - UserEvent: User interacted with a SendEvent-enabled component
 *   - LoadIndexListData: Device needs more items from a dynamicIndexList
 *   - LoadTokenListData: Device needs the next/prev page from a dynamicTokenList
 *   - RuntimeError: An error occurred during APL rendering
 */

import {
  Request,
  AlexaSkillRequest,
  AlexaSkillResponse,
  ResponseBody,
  Directive,
} from "../types/common";
import {
  APLUserEventRequest,
  APLLoadIndexListDataRequest,
  APLLoadTokenListDataRequest,
  APLRuntimeErrorRequest,
  APLRuntimeError,
} from "../types/apl";

// ===========================================================================
// Handler interfaces
// ===========================================================================

/**
 * Handler for APL UserEvent requests.
 * Invoked when the user interacts with a component that triggers
 * the SendEvent command.
 */
export interface APLUserEventHandler {
  /**
   * Determines whether this handler can handle the given request.
   */
  canHandle(request: APLUserEventRequest): boolean;

  /**
   * Handles the UserEvent request and returns a response.
   */
  handle(
    request: APLUserEventRequest,
    fullRequest: AlexaSkillRequest,
  ): AlexaSkillResponse | Promise<AlexaSkillResponse>;
}

/**
 * Handler for APL LoadIndexListData requests.
 * Invoked when the device needs more items for a dynamicIndexList.
 */
export interface APLLoadIndexListDataHandler {
  canHandle(request: APLLoadIndexListDataRequest): boolean;
  handle(
    request: APLLoadIndexListDataRequest,
    fullRequest: AlexaSkillRequest,
  ): AlexaSkillResponse | Promise<AlexaSkillResponse>;
}

/**
 * Handler for APL LoadTokenListData requests.
 * Invoked when the device needs the next page for a dynamicTokenList.
 */
export interface APLLoadTokenListDataHandler {
  canHandle(request: APLLoadTokenListDataRequest): boolean;
  handle(
    request: APLLoadTokenListDataRequest,
    fullRequest: AlexaSkillRequest,
  ): AlexaSkillResponse | Promise<AlexaSkillResponse>;
}

/**
 * Handler for APL RuntimeError requests.
 * Invoked when an error occurs during APL rendering.
 * Note: The skill can't return a meaningful response to RuntimeError.
 */
export interface APLRuntimeErrorHandler {
  canHandle(request: APLRuntimeErrorRequest): boolean;
  handle(
    request: APLRuntimeErrorRequest,
    fullRequest: AlexaSkillRequest,
  ): void | Promise<void>;
}

// ===========================================================================
// Request type guards
// ===========================================================================

export function isAPLUserEvent(
  request: Request,
): request is APLUserEventRequest {
  return request.type === "Alexa.Presentation.APL.UserEvent";
}

export function isAPLLoadIndexListData(
  request: Request,
): request is APLLoadIndexListDataRequest {
  return request.type === "Alexa.Presentation.APL.LoadIndexListData";
}

export function isAPLLoadTokenListData(
  request: Request,
): request is APLLoadTokenListDataRequest {
  return request.type === "Alexa.Presentation.APL.LoadTokenListData";
}

export function isAPLRuntimeError(
  request: Request,
): request is APLRuntimeErrorRequest {
  return request.type === "Alexa.Presentation.APL.RuntimeError";
}

// ===========================================================================
// Request data extraction utilities
// ===========================================================================

/**
 * Extract the arguments from a UserEvent request.
 */
export function getUserEventArguments(request: APLUserEventRequest): unknown[] {
  return request.arguments ?? [];
}

/**
 * Extract the source information from a UserEvent request.
 */
export function getUserEventSource(
  request: APLUserEventRequest,
): APLUserEventRequest["source"] | undefined {
  return request.source;
}

/**
 * Extract component values from a UserEvent request.
 * These are values reported by the components listed in the SendEvent
 * command's `components` property.
 */
export function getUserEventComponents(
  request: APLUserEventRequest,
): Record<string, unknown> {
  return request.components ?? {};
}

/**
 * Extract correlation token from a LoadIndexListData request.
 * Use this token when sending the SendIndexListData response directive.
 */
export function getLoadIndexListDataCorrelationToken(
  request: APLLoadIndexListDataRequest,
): string {
  return request.correlationToken;
}

/**
 * Extract the list ID and range from a LoadIndexListData request.
 */
export function getLoadIndexListDataParams(
  request: APLLoadIndexListDataRequest,
): {
  listId: string;
  startIndex: number;
  count: number;
  correlationToken: string;
} {
  return {
    listId: request.listId,
    startIndex: request.startIndex,
    count: request.count,
    correlationToken: request.correlationToken,
  };
}

/**
 * Extract the list ID and page token from a LoadTokenListData request.
 */
export function getLoadTokenListDataParams(
  request: APLLoadTokenListDataRequest,
): {
  listId: string;
  pageToken: string;
  correlationToken: string;
} {
  return {
    listId: request.listId,
    pageToken: request.pageToken,
    correlationToken: request.correlationToken,
  };
}

/**
 * Extract the errors from an APL RuntimeError request.
 */
export function getRuntimeErrors(
  request: APLRuntimeErrorRequest,
): APLRuntimeError[] {
  return request.errors;
}

// ===========================================================================
// SSML sanitization
// ===========================================================================

/**
 * Escape XML/SSML special characters in a plain-text string to prevent
 * SSML injection. Use this when interpolating user-provided or
 * externally-sourced text into SSML output.
 *
 * Characters escaped: `&`, `<`, `>`, `"`, `'`
 *
 * @example
 * ```typescript
 * const userInput = 'Turn <b>left</b> & "go"';
 * const safe = escapeSSML(userInput);
 * // => 'Turn &lt;b&gt;left&lt;/b&gt; &amp; &quot;go&quot;'
 * ```
 */
export function escapeSSML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ===========================================================================
// Response builder helpers
// ===========================================================================

/**
 * Create a minimal response with only directives (no outputSpeech or shouldEndSession).
 * Used when responding to LoadIndexListData or LoadTokenListData requests.
 */
export function createDirectiveOnlyResponse(
  directives: Directive[],
): AlexaSkillResponse {
  return {
    version: "1.0",
    response: {
      directives,
    },
  };
}

/**
 * Create a standard response with optional speech, reprompt, and directives.
 *
 * The `speech` and `repromptSpeech` strings are automatically sanitized
 * to escape XML/SSML special characters (`<`, `>`, `&`, `"`, `'`),
 * preventing SSML injection from user-provided input. If you need to pass
 * pre-formed SSML markup (e.g., `<emphasis>` or `<break>`), use
 * `createAPLResponseWithRawSSML` instead.
 */
export function createAPLResponse(options: {
  speech?: string;
  repromptSpeech?: string;
  directives?: Directive[];
  shouldEndSession?: boolean;
  sessionAttributes?: Record<string, unknown>;
}): AlexaSkillResponse {
  const response: ResponseBody = {};

  if (options.speech) {
    response.outputSpeech = {
      type: "SSML",
      ssml: `<speak>${escapeSSML(options.speech)}</speak>`,
    };
  }

  if (options.repromptSpeech) {
    response.reprompt = {
      outputSpeech: {
        type: "SSML",
        ssml: `<speak>${escapeSSML(options.repromptSpeech)}</speak>`,
      },
    };
  }

  if (options.directives) {
    response.directives = options.directives;
  }

  if (options.shouldEndSession !== undefined) {
    response.shouldEndSession = options.shouldEndSession;
  }

  const result: AlexaSkillResponse = {
    version: "1.0",
    response,
  };

  if (options.sessionAttributes) {
    result.sessionAttributes = options.sessionAttributes;
  }

  return result;
}

/**
 * Create a standard response with raw (pre-formed) SSML speech.
 *
 * Unlike `createAPLResponse`, the `ssml` and `repromptSsml` strings
 * are **not** sanitized — they are inserted into the `<speak>` wrapper
 * as-is. Only use this when you have already validated or constructed
 * the SSML yourself.
 *
 * **Warning:** Never pass unsanitized user input to `ssml` or `repromptSsml`.
 * Use `escapeSSML()` on any user-derived segments before including them
 * in your SSML string.
 *
 * @example
 * ```typescript
 * createAPLResponseWithRawSSML({
 *   ssml: `Hello <emphasis level="strong">${escapeSSML(userName)}</emphasis>`,
 * });
 * ```
 */
export function createAPLResponseWithRawSSML(options: {
  ssml?: string;
  repromptSsml?: string;
  directives?: Directive[];
  shouldEndSession?: boolean;
  sessionAttributes?: Record<string, unknown>;
}): AlexaSkillResponse {
  const response: ResponseBody = {};

  if (options.ssml) {
    response.outputSpeech = {
      type: "SSML",
      ssml: `<speak>${options.ssml}</speak>`,
    };
  }

  if (options.repromptSsml) {
    response.reprompt = {
      outputSpeech: {
        type: "SSML",
        ssml: `<speak>${options.repromptSsml}</speak>`,
      },
    };
  }

  if (options.directives) {
    response.directives = options.directives;
  }

  if (options.shouldEndSession !== undefined) {
    response.shouldEndSession = options.shouldEndSession;
  }

  const result: AlexaSkillResponse = {
    version: "1.0",
    response,
  };

  if (options.sessionAttributes) {
    result.sessionAttributes = options.sessionAttributes;
  }

  return result;
}
