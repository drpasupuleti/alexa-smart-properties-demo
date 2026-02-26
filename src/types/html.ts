/**
 * Alexa.Presentation.HTML Interface types.
 *
 * The Alexa.Presentation.HTML interface enables skills to render
 * interactive web content on screen devices (e.g., Echo Show, Fire TV).
 * It provides bidirectional message passing between the skill backend
 * and a web app running in the device's HTML runtime.
 *
 * Directives:
 *   - Start: Launch the HTML runtime with a web app URL
 *   - HandleMessage: Send a message from the skill to the running web app
 *
 * Requests:
 *   - Message: Receive a message sent from the web app to the skill
 */

import { Directive, Request } from "./common";

// ===========================================================================
// HTML Runtime Configuration
// ===========================================================================

/**
 * Configuration for the HTML runtime session.
 */
export interface HTMLConfiguration {
  /**
   * The number of seconds the web app can remain on screen without
   * user interaction before the session times out. The minimum value
   * is 30 seconds and the maximum is 300 seconds (5 minutes).
   * Defaults to 30 seconds.
   */
  timeoutInSeconds?: number;
}

/**
 * A transformer applied to a data source before it is sent to the
 * web app. Transformers can convert SSML to speech, text to hint, etc.
 */
export interface HTMLTransformer {
  /** The transformer type (e.g., "ssmlToSpeech", "textToHint"). */
  transformer: string;
  /** The JSON path to the input data in the data source. */
  inputPath: string;
  /** The name of the output property in the data source. */
  outputName: string;
}

// ===========================================================================
// DIRECTIVES
// ===========================================================================

// ---- Start ----------------------------------------------------------------

/**
 * Launches the HTML runtime on the device and loads the specified
 * web app. The web app URL must be HTTPS and on an allowlisted domain.
 *
 * Include this directive in your skill response to start an HTML
 * experience. You can also optionally provide data and transformers
 * to pass initial context to the web app.
 */
export interface HTMLStartDirective extends Directive {
  type: "Alexa.Presentation.HTML.Start";
  /** Configuration for the HTML runtime session. */
  configuration?: HTMLConfiguration;
  /** An object containing data to pass to the web app on load. */
  data?: Record<string, unknown>;
  /**
   * An array of transformers to apply to the data before sending
   * it to the web app.
   */
  transformers?: HTMLTransformer[];
  /** The HTTPS URL of the web app to load. */
  request: {
    uri: string;
    method: "GET";
    headers?: Record<string, string>;
  };
}

// ---- HandleMessage --------------------------------------------------------

/**
 * Sends a message from the skill to the currently running web app.
 * The web app receives this message via the Alexa HTML SDK's
 * `onMessage` callback.
 *
 * Use this directive to send data updates, state changes, or
 * commands to the web app in response to user interactions or
 * other events.
 */
export interface HTMLHandleMessageDirective extends Directive {
  type: "Alexa.Presentation.HTML.HandleMessage";
  /** The message payload to send to the web app. */
  message: Record<string, unknown>;
  /**
   * An array of transformers to apply to the message before
   * sending it to the web app.
   */
  transformers?: HTMLTransformer[];
}

// ===========================================================================
// REQUESTS (incoming from Alexa to skill)
// ===========================================================================

// ---- Message --------------------------------------------------------------

/**
 * Sent to the skill when the web app sends a message via the
 * Alexa HTML SDK's `sendMessage` method. The message payload
 * is an arbitrary object defined by the web app.
 */
export interface HTMLMessageRequest extends Request {
  type: "Alexa.Presentation.HTML.Message";
  /** The message payload sent by the web app. */
  message: Record<string, unknown>;
}
