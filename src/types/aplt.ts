/**
 * Alexa.Presentation.APLT Interface types.
 *
 * Provides directives for displaying content on a device with a
 * character display, such as the LED 7-segment alphanumeric clock
 * display on the Echo Dot with clock.
 *
 * Directives:
 *   - RenderDocument
 *   - ExecuteCommands
 */

import { Directive } from "./common";

// ===========================================================================
// APLT Document types
// ===========================================================================

/**
 * An APLT document for character displays.
 */
export interface APLTDocument {
  type: "APLT";
  version: string;
  description?: string;
  mainTemplate: APLTMainTemplate;
  [key: string]: unknown;
}

export interface APLTMainTemplate {
  parameters?: string[];
  item?: APLTComponent;
  items?: APLTComponent[];
}

// ===========================================================================
// APLT Component types
// ===========================================================================

/**
 * Base APLT component. APLT components represent elements displayed
 * on a character display (e.g. Text, Container, Pager, TimeText).
 */
export interface APLTComponent {
  type: APLTComponentType;
  id?: string;
  when?: boolean | string;
  description?: string;
  // Text-specific
  text?: string;
  textAlign?: "left" | "right" | "center";
  overflow?: "clip" | "marquee";
  // Container/Pager multi-child
  items?: APLTComponent[];
  item?: APLTComponent;
  // TimeText-specific
  format?: string;
  [key: string]: unknown;
}

export type APLTComponentType = "Text" | "Container" | "Pager" | "TimeText";

// ===========================================================================
// APLT Command types
// ===========================================================================

export interface APLTCommand {
  type: string;
  description?: string;
  delay?: number;
  when?: boolean | string;
  componentId?: string;
  property?: string;
  value?: unknown;
  [key: string]: unknown;
}

// ===========================================================================
// DIRECTIVES
// ===========================================================================

/**
 * Instructs the device to display the APL content provided in the
 * specified APLT document.
 */
export interface APLTRenderDocumentDirective extends Directive {
  type: "Alexa.Presentation.APLT.RenderDocument";
  token: string;
  targetProfile?: "FOUR_CHARACTER_CLOCK";
  document: APLTDocument;
  datasources?: Record<string, unknown>;
}

/**
 * Instructs the device to run the provided commands on the currently
 * rendered APLT document.
 */
export interface APLTExecuteCommandsDirective extends Directive {
  type: "Alexa.Presentation.APLT.ExecuteCommands";
  token: string;
  commands: APLTCommand[];
}
