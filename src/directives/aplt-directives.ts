/**
 * Alexa.Presentation.APLT directive builders.
 *
 * Provides factory functions and builder classes for constructing
 * APLT (APL for character displays) directives to send back to Alexa
 * in skill responses.
 */

import {
  APLTDocument,
  APLTCommand,
  APLTRenderDocumentDirective,
  APLTExecuteCommandsDirective,
} from "../types/aplt";

// ===========================================================================
// RenderDocument builder
// ===========================================================================

export class APLTRenderDocumentDirectiveBuilder {
  private token: string = "";
  private targetProfile?: "FOUR_CHARACTER_CLOCK";
  private document: APLTDocument | null = null;
  private datasources: Record<string, unknown> = {};

  /**
   * Set the unique identifier for this character display presentation.
   */
  setToken(token: string): this {
    this.token = token;
    return this;
  }

  /**
   * Set the target device profile. Since this is currently always
   * FOUR_CHARACTER_CLOCK, this property can be omitted.
   */
  setTargetProfile(profile: "FOUR_CHARACTER_CLOCK"): this {
    this.targetProfile = profile;
    return this;
  }

  /**
   * Set the APLT document to render on the character display.
   */
  setDocument(document: APLTDocument): this {
    this.document = document;
    return this;
  }

  /**
   * Add a data source to bind to the APLT document.
   */
  addDataSource(name: string, dataSource: Record<string, unknown>): this {
    this.datasources[name] = dataSource;
    return this;
  }

  /**
   * Build and return the APLT RenderDocument directive.
   * @throws Error if required properties are missing.
   */
  build(): APLTRenderDocumentDirective {
    if (!this.token) {
      throw new Error("APLT RenderDocument directive requires a token");
    }
    if (!this.document) {
      throw new Error("APLT RenderDocument directive requires a document");
    }

    const directive: APLTRenderDocumentDirective = {
      type: "Alexa.Presentation.APLT.RenderDocument",
      token: this.token,
      document: this.document,
    };

    if (this.targetProfile) {
      directive.targetProfile = this.targetProfile;
    }

    if (Object.keys(this.datasources).length > 0) {
      directive.datasources = this.datasources;
    }

    return directive;
  }
}

// ===========================================================================
// ExecuteCommands builder
// ===========================================================================

export class APLTExecuteCommandsDirectiveBuilder {
  private token: string = "";
  private commands: APLTCommand[] = [];

  /**
   * Set the token that matches the token from the RenderDocument directive.
   */
  setToken(token: string): this {
    this.token = token;
    return this;
  }

  /**
   * Add a command to execute on the character display document.
   */
  addCommand(command: APLTCommand): this {
    this.commands.push(command);
    return this;
  }

  /**
   * Add multiple commands. Providing more than one command is equivalent
   * to using the Sequential command.
   */
  addCommands(commands: APLTCommand[]): this {
    this.commands.push(...commands);
    return this;
  }

  /**
   * Build and return the APLT ExecuteCommands directive.
   * @throws Error if required properties are missing.
   */
  build(): APLTExecuteCommandsDirective {
    if (!this.token) {
      throw new Error("APLT ExecuteCommands directive requires a token");
    }
    if (this.commands.length === 0) {
      throw new Error(
        "APLT ExecuteCommands directive requires at least one command",
      );
    }

    return {
      type: "Alexa.Presentation.APLT.ExecuteCommands",
      token: this.token,
      commands: this.commands,
    };
  }
}

// ===========================================================================
// Convenience factory functions
// ===========================================================================

/**
 * Create an APLT RenderDocument directive.
 *
 * Validates all required fields before returning the directive.
 * @throws Error if `token` is empty or `document` is missing.
 */
export function createAPLTRenderDocumentDirective(
  token: string,
  document: APLTDocument,
  datasources?: Record<string, unknown>,
  targetProfile?: "FOUR_CHARACTER_CLOCK",
): APLTRenderDocumentDirective {
  const builder = new APLTRenderDocumentDirectiveBuilder()
    .setToken(token)
    .setDocument(document);

  if (targetProfile) {
    builder.setTargetProfile(targetProfile);
  }
  if (datasources) {
    for (const [name, ds] of Object.entries(datasources)) {
      builder.addDataSource(name, ds as Record<string, unknown>);
    }
  }

  return builder.build();
}

/**
 * Create an APLT ExecuteCommands directive.
 *
 * Validates all required fields before returning the directive.
 * @throws Error if `token` is empty or `commands` is empty.
 */
export function createAPLTExecuteCommandsDirective(
  token: string,
  commands: APLTCommand[],
): APLTExecuteCommandsDirective {
  return new APLTExecuteCommandsDirectiveBuilder()
    .setToken(token)
    .addCommands(commands)
    .build();
}
