/**
 * Directive Validator.
 *
 * Provides validation logic for APL directives before they are sent
 * back to Alexa. Validates required properties and structural constraints.
 */

import { Directive } from "../types/common";
import {
  APLRenderDocumentDirective,
  APLExecuteCommandsDirective,
} from "../types/apl";
import { APLARenderDocumentDirective } from "../types/apla";
import {
  APLTRenderDocumentDirective,
  APLTExecuteCommandsDirective,
} from "../types/aplt";
import {
  AudioPlayerPlayDirective,
  AudioPlayerClearQueueDirective,
} from "../types/audioplayer";
import { VideoAppLaunchDirective } from "../types/videoapp";

// ===========================================================================
// Validation result types
// ===========================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// ===========================================================================
// Generic validator
// ===========================================================================

/**
 * The set of directive types recognized by the validator.
 * Use `isSupportedDirectiveType` to check membership.
 */
export const SUPPORTED_DIRECTIVE_TYPES = new Set([
  "Alexa.Presentation.APL.RenderDocument",
  "Alexa.Presentation.APL.ExecuteCommands",
  "Alexa.Presentation.APL.SendIndexListData",
  "Alexa.Presentation.APL.SendTokenListData",
  "Alexa.Presentation.APL.UpdateIndexListData",
  "Alexa.Presentation.APLA.RenderDocument",
  "Alexa.Presentation.APLT.RenderDocument",
  "Alexa.Presentation.APLT.ExecuteCommands",
] as const);

/**
 * Check if a directive type string is recognized by the validator.
 */
export function isSupportedDirectiveType(type: string): boolean {
  return SUPPORTED_DIRECTIVE_TYPES.has(type as never);
}

/**
 * Validate any APL-related directive.
 * Dispatches to the appropriate validator based on the directive type.
 *
 * Returns invalid with an `UNRECOGNIZED_DIRECTIVE_TYPE` error for any
 * directive whose `type` is not a known APL directive type. This
 * prevents silently accepting malformed or misspelled directive types.
 */
export function validateDirective(directive: Directive): ValidationResult {
  if (!directive.type || typeof directive.type !== "string") {
    return createResult([
      {
        field: "type",
        message: "Directive type is required and must be a non-empty string",
      },
    ]);
  }

  switch (directive.type) {
    case "Alexa.Presentation.APL.RenderDocument":
      return validateAPLRenderDocument(directive as APLRenderDocumentDirective);
    case "Alexa.Presentation.APL.ExecuteCommands":
      return validateAPLExecuteCommands(
        directive as APLExecuteCommandsDirective,
      );
    case "Alexa.Presentation.APLA.RenderDocument":
      return validateAPLARenderDocument(
        directive as APLARenderDocumentDirective,
      );
    case "Alexa.Presentation.APLT.RenderDocument":
      return validateAPLTRenderDocument(
        directive as APLTRenderDocumentDirective,
      );
    case "Alexa.Presentation.APLT.ExecuteCommands":
      return validateAPLTExecuteCommands(
        directive as APLTExecuteCommandsDirective,
      );
    case "AudioPlayer.Play":
      return validateAudioPlayerPlay(directive as AudioPlayerPlayDirective);
    case "AudioPlayer.Stop":
      // Stop has no additional properties to validate
      return createResult();
    case "AudioPlayer.ClearQueue":
      return validateAudioPlayerClearQueue(
        directive as AudioPlayerClearQueueDirective,
      );
    case "VideoApp.Launch":
      return validateVideoAppLaunch(directive as VideoAppLaunchDirective);
    default:
      return createResult([
        {
          field: "type",
          message:
            `Unrecognized directive type "${directive.type}". ` +
            `Supported types: ${[...SUPPORTED_DIRECTIVE_TYPES].join(", ")}`,
        },
      ]);
  }
}

// ===========================================================================
// APL validators
// ===========================================================================

/**
 * Validate an APL RenderDocument directive.
 */
export function validateAPLRenderDocument(
  directive: APLRenderDocumentDirective,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (directive.type !== "Alexa.Presentation.APL.RenderDocument") {
    errors.push({
      field: "type",
      message: 'Must be "Alexa.Presentation.APL.RenderDocument"',
    });
  }

  if (!directive.token || typeof directive.token !== "string") {
    errors.push({
      field: "token",
      message: "Token is required and must be a string",
    });
  }

  if (!directive.document) {
    errors.push({ field: "document", message: "Document is required" });
  } else {
    if (!directive.document.type) {
      errors.push({
        field: "document.type",
        message: "Document type is required (APL or Link)",
      });
    }

    if (directive.document.type === "Link") {
      if (!directive.document.src) {
        errors.push({
          field: "document.src",
          message: "Document src is required when type is Link",
        });
      } else if (
        !directive.document.src.startsWith("doc://alexa/apl/documents/")
      ) {
        errors.push({
          field: "document.src",
          message:
            "Document src must have the format: doc://alexa/apl/documents/<document-name>",
        });
      }
    }

    if (directive.document.type === "APL") {
      if (!directive.document.mainTemplate) {
        errors.push({
          field: "document.mainTemplate",
          message: "mainTemplate is required for inline APL documents",
        });
      }
    }
  }

  return createResult(errors);
}

/**
 * Validate an APL ExecuteCommands directive.
 */
export function validateAPLExecuteCommands(
  directive: APLExecuteCommandsDirective,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (directive.type !== "Alexa.Presentation.APL.ExecuteCommands") {
    errors.push({
      field: "type",
      message: 'Must be "Alexa.Presentation.APL.ExecuteCommands"',
    });
  }

  if (!directive.token && !directive.presentationUri) {
    errors.push({
      field: "token/presentationUri",
      message:
        "Either token (for documents) or presentationUri (for widgets) is required",
    });
  }

  if (
    !directive.commands ||
    !Array.isArray(directive.commands) ||
    directive.commands.length === 0
  ) {
    errors.push({
      field: "commands",
      message: "At least one command is required",
    });
  } else {
    directive.commands.forEach((cmd, i) => {
      if (!cmd.type) {
        errors.push({
          field: `commands[${i}].type`,
          message: "Command type is required",
        });
      }
    });
  }

  return createResult(errors);
}

// ===========================================================================
// APLA validators
// ===========================================================================

/**
 * Validate an APLA RenderDocument directive.
 */
export function validateAPLARenderDocument(
  directive: APLARenderDocumentDirective,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (directive.type !== "Alexa.Presentation.APLA.RenderDocument") {
    errors.push({
      field: "type",
      message: 'Must be "Alexa.Presentation.APLA.RenderDocument"',
    });
  }

  if (!directive.document) {
    errors.push({ field: "document", message: "Document is required" });
  } else {
    if (directive.document.type === "Link") {
      if (!directive.document.src) {
        errors.push({
          field: "document.src",
          message: "Document src is required when type is Link",
        });
      } else if (
        !directive.document.src.startsWith("doc://alexa/apla/documents/")
      ) {
        errors.push({
          field: "document.src",
          message:
            "Document src must have the format: doc://alexa/apla/documents/<document-name>",
        });
      }
    }

    if (directive.document.type === "APLA") {
      if (!directive.document.mainTemplate) {
        errors.push({
          field: "document.mainTemplate",
          message: "mainTemplate is required for inline APLA documents",
        });
      }
    }
  }

  return createResult(errors);
}

// ===========================================================================
// APLT validators
// ===========================================================================

/**
 * Validate an APLT RenderDocument directive.
 */
export function validateAPLTRenderDocument(
  directive: APLTRenderDocumentDirective,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (directive.type !== "Alexa.Presentation.APLT.RenderDocument") {
    errors.push({
      field: "type",
      message: 'Must be "Alexa.Presentation.APLT.RenderDocument"',
    });
  }

  if (!directive.token || typeof directive.token !== "string") {
    errors.push({
      field: "token",
      message: "Token is required and must be a string",
    });
  }

  if (!directive.document) {
    errors.push({ field: "document", message: "Document is required" });
  } else {
    if (directive.document.type !== "APLT") {
      errors.push({
        field: "document.type",
        message: 'Document type must be "APLT"',
      });
    }
    if (!directive.document.mainTemplate) {
      errors.push({
        field: "document.mainTemplate",
        message: "mainTemplate is required",
      });
    }
  }

  if (
    directive.targetProfile &&
    directive.targetProfile !== "FOUR_CHARACTER_CLOCK"
  ) {
    errors.push({
      field: "targetProfile",
      message: 'targetProfile must be "FOUR_CHARACTER_CLOCK" if specified',
    });
  }

  return createResult(errors);
}

/**
 * Validate an APLT ExecuteCommands directive.
 */
export function validateAPLTExecuteCommands(
  directive: APLTExecuteCommandsDirective,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (directive.type !== "Alexa.Presentation.APLT.ExecuteCommands") {
    errors.push({
      field: "type",
      message: 'Must be "Alexa.Presentation.APLT.ExecuteCommands"',
    });
  }

  if (!directive.token || typeof directive.token !== "string") {
    errors.push({
      field: "token",
      message: "Token is required and must match the RenderDocument token",
    });
  }

  if (
    !directive.commands ||
    !Array.isArray(directive.commands) ||
    directive.commands.length === 0
  ) {
    errors.push({
      field: "commands",
      message: "At least one command is required",
    });
  }

  return createResult(errors);
}

// ===========================================================================
// AudioPlayer validators
// ===========================================================================

/**
 * Validate an AudioPlayer.Play directive.
 */
export function validateAudioPlayerPlay(
  directive: AudioPlayerPlayDirective,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (directive.type !== "AudioPlayer.Play") {
    errors.push({
      field: "type",
      message: 'Must be "AudioPlayer.Play"',
    });
  }

  const validBehaviors = ["REPLACE_ALL", "ENQUEUE", "REPLACE_ENQUEUED"];
  if (!directive.playBehavior || !validBehaviors.includes(directive.playBehavior)) {
    errors.push({
      field: "playBehavior",
      message:
        "playBehavior is required and must be REPLACE_ALL, ENQUEUE, or REPLACE_ENQUEUED",
    });
  }

  if (!directive.audioItem) {
    errors.push({
      field: "audioItem",
      message: "audioItem is required",
    });
  } else {
    if (!directive.audioItem.stream) {
      errors.push({
        field: "audioItem.stream",
        message: "stream is required",
      });
    } else {
      const stream = directive.audioItem.stream;

      if (!stream.url) {
        errors.push({
          field: "audioItem.stream.url",
          message: "Stream URL is required",
        });
      } else if (!stream.url.startsWith("https://")) {
        errors.push({
          field: "audioItem.stream.url",
          message: "Stream URL must use HTTPS protocol",
        });
      }

      if (!stream.token) {
        errors.push({
          field: "audioItem.stream.token",
          message: "Stream token is required",
        });
      }

      if (stream.offsetInMilliseconds === undefined || stream.offsetInMilliseconds === null) {
        errors.push({
          field: "audioItem.stream.offsetInMilliseconds",
          message: "offsetInMilliseconds is required",
        });
      } else if (stream.offsetInMilliseconds < 0) {
        errors.push({
          field: "audioItem.stream.offsetInMilliseconds",
          message: "offsetInMilliseconds must be non-negative",
        });
      }

      if (
        directive.playBehavior === "ENQUEUE" &&
        !stream.expectedPreviousToken
      ) {
        errors.push({
          field: "audioItem.stream.expectedPreviousToken",
          message:
            "expectedPreviousToken is required when playBehavior is ENQUEUE",
        });
      }
// VideoApp validators
// ===========================================================================

/**
 * Validate a VideoApp.Launch directive.
 */
export function validateVideoAppLaunch(
  directive: VideoAppLaunchDirective,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (directive.type !== "VideoApp.Launch") {
    errors.push({
      field: "type",
      message: 'Must be "VideoApp.Launch"',
    });
  }

  if (!directive.videoItem) {
    errors.push({
      field: "videoItem",
      message: "videoItem is required",
    });
  } else {
    if (
      !directive.videoItem.sources ||
      !Array.isArray(directive.videoItem.sources) ||
      directive.videoItem.sources.length === 0
    ) {
      errors.push({
        field: "videoItem.sources",
        message: "At least one video source is required",
      });
    } else {
      directive.videoItem.sources.forEach((source, i) => {
        if (!source.url) {
          errors.push({
            field: `videoItem.sources[${i}].url`,
            message: "Source URL is required",
          });
        } else if (!source.url.startsWith("https://")) {
          errors.push({
            field: `videoItem.sources[${i}].url`,
            message: "Source URL must use HTTPS protocol",
          });
        }

        if (
          source.offsetInMilliseconds !== undefined &&
          source.offsetInMilliseconds < 0
        ) {
          errors.push({
            field: `videoItem.sources[${i}].offsetInMilliseconds`,
            message: "offsetInMilliseconds must be non-negative",
          });
        }

        if (source.sizeInBytes !== undefined && source.sizeInBytes < 0) {
          errors.push({
            field: `videoItem.sources[${i}].sizeInBytes`,
            message: "sizeInBytes must be non-negative",
          });
        }
      });
    }
  }

  return createResult(errors);
}

/**
 * Validate an AudioPlayer.ClearQueue directive.
 */
export function validateAudioPlayerClearQueue(
  directive: AudioPlayerClearQueueDirective,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (directive.type !== "AudioPlayer.ClearQueue") {
    errors.push({
      field: "type",
      message: 'Must be "AudioPlayer.ClearQueue"',
    });
  }

  const validBehaviors = ["CLEAR_ENQUEUED", "CLEAR_ALL"];
  if (
    !directive.clearBehavior ||
    !validBehaviors.includes(directive.clearBehavior)
  ) {
    errors.push({
      field: "clearBehavior",
      message: "clearBehavior is required and must be CLEAR_ENQUEUED or CLEAR_ALL",
    });
  }

  return createResult(errors);
}

// ===========================================================================
// Helpers
// ===========================================================================

function createResult(errors: ValidationError[] = []): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
  };
}
