/**
 * Alexa.Presentation.APLA Interface types.
 *
 * Provides directives and requests for rendering audio responses
 * defined in APLA (APL for Audio) documents.
 *
 * Directives:
 *   - RenderDocument
 *
 * Requests:
 *   - RuntimeError
 */

import { Directive, Request } from "./common";

// ===========================================================================
// APLA Document types
// ===========================================================================

/**
 * An APLA document for audio rendering.
 * When `type` is "APLA", the document contains the full JSON structure.
 * When `type` is "Link", `src` references a document saved in the authoring tool.
 */
export interface APLADocument {
  type: "APLA" | "Link";
  version?: string;
  src?: string;
  description?: string;
  import?: APLAImport[];
  resources?: APLAResource[];
  mainTemplate?: APLAMainTemplate;
  [key: string]: unknown;
}

export interface APLAImport {
  name: string;
  version: string;
  source?: string;
}

export interface APLAResource {
  description?: string;
  when?: string;
  strings?: Record<string, string>;
  numbers?: Record<string, number>;
  booleans?: Record<string, boolean>;
}

export interface APLAMainTemplate {
  parameters?: string[];
  item?: APLAComponent;
  items?: APLAComponent[];
}

// ===========================================================================
// APLA Component types
// ===========================================================================

/**
 * Base APLA component. APLA components represent audio elements such as
 * Speech, Audio, Silence, Mixer, Selector, and Sequencer.
 */
export interface APLAComponent {
  type: APLAComponentType;
  when?: boolean | string;
  description?: string;
  // Speech-specific
  content?: string;
  contentType?: "text" | "SSML";
  // Audio-specific
  source?: string;
  // Silence-specific
  duration?: number;
  // Multi-child (Mixer, Selector, Sequencer)
  items?: APLAComponent[];
  // Selector-specific
  strategy?: "normal" | "random";
  // Filters
  filter?: APLAFilter[];
  [key: string]: unknown;
}

export type APLAComponentType =
  | "Speech"
  | "Audio"
  | "Silence"
  | "Mixer"
  | "Selector"
  | "Sequencer";

export interface APLAFilter {
  type: string;
  [key: string]: unknown;
}

// ===========================================================================
// DIRECTIVES
// ===========================================================================

/**
 * Instructs the device to play the audio response defined in the
 * specified APLA document. You can also optionally provide one or more
 * datasources to bind content to the document.
 */
export interface APLARenderDocumentDirective extends Directive {
  type: "Alexa.Presentation.APLA.RenderDocument";
  token?: string;
  document: APLADocument;
  datasources?: Record<string, unknown>;
}

// ===========================================================================
// REQUESTS
// ===========================================================================

/**
 * Sent to notify the skill about any errors that happened during
 * APL audio processing.
 */
export interface APLARuntimeErrorRequest extends Request {
  type: "Alexa.Presentation.APLA.RuntimeError";
  token: string;
  errors: APLARuntimeError[];
}

/**
 * An error reported in the APLA RuntimeError request.
 */
export interface APLARuntimeError {
  type: APLARuntimeErrorType;
  reason: APLARuntimeErrorReason;
  message: string;
}

/**
 * Polymorphic error type indicator. Each error type can have
 * type-specific parameters.
 */
export type APLARuntimeErrorType = "RENDER_ERROR" | "LINK_ERROR";

/**
 * Provides an error code indicating the reason for the error.
 */
export type APLARuntimeErrorReason =
  | "UNKNOWN_ERROR"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_FOUND_ERROR";
