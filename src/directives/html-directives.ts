/**
 * Alexa.Presentation.HTML directive builders.
 *
 * Provides factory functions and builder classes for constructing
 * HTML directives to send back to Alexa in skill responses.
 *
 * The HTML interface enables skills to render interactive web content
 * on screen devices, with bidirectional message passing between the
 * skill backend and the web app.
 */

import {
  HTMLStartDirective,
  HTMLHandleMessageDirective,
  HTMLConfiguration,
  HTMLTransformer,
} from "../types/html";

// ===========================================================================
// Constants
// ===========================================================================

/**
 * Minimum allowed timeout for the HTML runtime session, in seconds.
 */
export const HTML_MIN_TIMEOUT_SECONDS = 30;

/**
 * Maximum allowed timeout for the HTML runtime session, in seconds.
 */
export const HTML_MAX_TIMEOUT_SECONDS = 300;

// ===========================================================================
// Start directive builder
// ===========================================================================

export class HTMLStartDirectiveBuilder {
  private uri: string = "";
  private timeoutInSeconds?: number;
  private data?: Record<string, unknown>;
  private transformers: HTMLTransformer[] = [];
  private headers?: Record<string, string>;

  /**
   * Set the HTTPS URL of the web app to load in the HTML runtime.
   * The URL must use the HTTPS protocol.
   *
   * @throws Error if the URL does not start with "https://".
   */
  setUri(uri: string): this {
    if (!uri || !uri.startsWith("https://")) {
      throw new Error(
        "HTML Start directive requires an HTTPS URL " +
          `(got "${uri || ""}")`,
      );
    }
    this.uri = uri;
    return this;
  }

  /**
   * Set the session timeout in seconds. Must be between 30 and 300.
   *
   * @throws Error if the timeout is out of the allowed range.
   */
  setTimeoutInSeconds(seconds: number): this {
    if (seconds < HTML_MIN_TIMEOUT_SECONDS || seconds > HTML_MAX_TIMEOUT_SECONDS) {
      throw new Error(
        `HTML timeout must be between ${HTML_MIN_TIMEOUT_SECONDS} and ` +
          `${HTML_MAX_TIMEOUT_SECONDS} seconds (got ${seconds})`,
      );
    }
    this.timeoutInSeconds = seconds;
    return this;
  }

  /**
   * Set initial data to pass to the web app on load.
   */
  setData(data: Record<string, unknown>): this {
    this.data = data;
    return this;
  }

  /**
   * Add a transformer to apply to the data before sending.
   */
  addTransformer(transformer: HTMLTransformer): this {
    this.transformers.push(transformer);
    return this;
  }

  /**
   * Set custom HTTP headers for the web app request.
   */
  setHeaders(headers: Record<string, string>): this {
    this.headers = headers;
    return this;
  }

  /**
   * Build and return the Start directive.
   * @throws Error if required properties are missing.
   */
  build(): HTMLStartDirective {
    if (!this.uri) {
      throw new Error(
        "HTML Start directive requires a URI. Call setUri() first.",
      );
    }

    const directive: HTMLStartDirective = {
      type: "Alexa.Presentation.HTML.Start",
      request: {
        uri: this.uri,
        method: "GET",
      },
    };

    if (this.timeoutInSeconds !== undefined) {
      directive.configuration = {
        timeoutInSeconds: this.timeoutInSeconds,
      };
    }

    if (this.data) {
      directive.data = this.data;
    }

    if (this.transformers.length > 0) {
      directive.transformers = [...this.transformers];
    }

    if (this.headers) {
      directive.request.headers = { ...this.headers };
    }

    return directive;
  }
}

// ===========================================================================
// HandleMessage directive builder
// ===========================================================================

export class HTMLHandleMessageDirectiveBuilder {
  private message: Record<string, unknown> | null = null;
  private transformers: HTMLTransformer[] = [];

  /**
   * Set the message payload to send to the web app.
   */
  setMessage(message: Record<string, unknown>): this {
    this.message = message;
    return this;
  }

  /**
   * Add a transformer to apply to the message before sending.
   */
  addTransformer(transformer: HTMLTransformer): this {
    this.transformers.push(transformer);
    return this;
  }

  /**
   * Build and return the HandleMessage directive.
   * @throws Error if required properties are missing.
   */
  build(): HTMLHandleMessageDirective {
    if (!this.message) {
      throw new Error(
        "HTML HandleMessage directive requires a message. " +
          "Call setMessage() first.",
      );
    }

    const directive: HTMLHandleMessageDirective = {
      type: "Alexa.Presentation.HTML.HandleMessage",
      message: this.message,
    };

    if (this.transformers.length > 0) {
      directive.transformers = [...this.transformers];
    }

    return directive;
  }
}

// ===========================================================================
// Convenience factory functions
// ===========================================================================

/**
 * Create a Start directive to launch the HTML runtime.
 *
 * Validates all required fields before returning the directive.
 * @throws Error if `uri` is not a valid HTTPS URL.
 */
export function createHTMLStartDirective(
  uri: string,
  options?: {
    data?: Record<string, unknown>;
    timeoutInSeconds?: number;
    transformers?: HTMLTransformer[];
    headers?: Record<string, string>;
  },
): HTMLStartDirective {
  const builder = new HTMLStartDirectiveBuilder().setUri(uri);

  if (options?.timeoutInSeconds !== undefined) {
    builder.setTimeoutInSeconds(options.timeoutInSeconds);
  }
  if (options?.data) {
    builder.setData(options.data);
  }
  if (options?.transformers) {
    for (const t of options.transformers) {
      builder.addTransformer(t);
    }
  }
  if (options?.headers) {
    builder.setHeaders(options.headers);
  }

  return builder.build();
}

/**
 * Create a HandleMessage directive to send data to the web app.
 *
 * Validates all required fields before returning the directive.
 * @throws Error if `message` is missing.
 */
export function createHTMLHandleMessageDirective(
  message: Record<string, unknown>,
  transformers?: HTMLTransformer[],
): HTMLHandleMessageDirective {
  const builder = new HTMLHandleMessageDirectiveBuilder().setMessage(message);

  if (transformers) {
    for (const t of transformers) {
      builder.addTransformer(t);
    }
  }

  return builder.build();
}
