/**
 * Alexa.Presentation.APLA directive builders.
 *
 * Provides factory functions and a builder class for constructing
 * APLA (APL for Audio) directives to send back to Alexa in skill responses.
 */

import { APLADocument, APLARenderDocumentDirective } from "../types/apla";
import { assertValidDocumentName } from "../validators/document-name-validator";

// ===========================================================================
// RenderDocument builder
// ===========================================================================

export class APLARenderDocumentDirectiveBuilder {
  private token?: string;
  private document: APLADocument | null = null;
  private datasources: Record<string, unknown> = {};

  /**
   * Set the unique identifier for this audio presentation.
   * Used to associate future events and directives with this presentation.
   */
  setToken(token: string): this {
    this.token = token;
    return this;
  }

  /**
   * Set the APLA document to render as audio.
   * Can be either a full inline APLA document (type: "APLA") or a link
   * to a document saved in the authoring tool (type: "Link").
   */
  setDocument(document: APLADocument): this {
    this.document = document;
    return this;
  }

  /**
   * Set a link to a document saved in the authoring tool.
   * Creates a Link-type document reference.
   *
   * The document name is validated to contain only safe characters
   * (alphanumeric, hyphens, underscores, periods) and must be 1–128
   * characters long. Path traversal sequences (`..`) are rejected.
   *
   * @param documentName The name used when saving the document.
   * @throws Error if the document name contains invalid characters.
   */
  setDocumentLink(documentName: string): this {
    assertValidDocumentName(documentName, "APLA");
    this.document = {
      type: "Link",
      src: `doc://alexa/apla/documents/${documentName}`,
    };
    return this;
  }

  /**
   * Add a data source to bind to the APLA document.
   */
  addDataSource(name: string, dataSource: Record<string, unknown>): this {
    this.datasources[name] = dataSource;
    return this;
  }

  /**
   * Build and return the APLA RenderDocument directive.
   * @throws Error if required properties are missing.
   */
  build(): APLARenderDocumentDirective {
    if (!this.document) {
      throw new Error("APLA RenderDocument directive requires a document");
    }

    const directive: APLARenderDocumentDirective = {
      type: "Alexa.Presentation.APLA.RenderDocument",
      document: this.document,
    };

    if (this.token) {
      directive.token = this.token;
    }

    if (Object.keys(this.datasources).length > 0) {
      directive.datasources = this.datasources;
    }

    return directive;
  }
}

// ===========================================================================
// Convenience factory functions
// ===========================================================================

/**
 * Create an APLA RenderDocument directive from a full APLA document.
 *
 * Validates all required fields before returning the directive.
 * @throws Error if `document` is missing.
 */
export function createAPLARenderDocumentDirective(
  document: APLADocument,
  token?: string,
  datasources?: Record<string, unknown>,
): APLARenderDocumentDirective {
  const builder = new APLARenderDocumentDirectiveBuilder().setDocument(document);

  if (token) {
    builder.setToken(token);
  }
  if (datasources) {
    for (const [name, ds] of Object.entries(datasources)) {
      builder.addDataSource(name, ds as Record<string, unknown>);
    }
  }

  return builder.build();
}

/**
 * Create an APLA RenderDocument directive from a linked document.
 *
 * The document name is validated to contain only safe characters.
 * @throws Error if `documentName` is invalid.
 */
export function createLinkedAPLARenderDocumentDirective(
  documentName: string,
  token?: string,
  datasources?: Record<string, unknown>,
): APLARenderDocumentDirective {
  assertValidDocumentName(documentName, "APLA");
  return createAPLARenderDocumentDirective(
    {
      type: "Link",
      src: `doc://alexa/apla/documents/${documentName}`,
    },
    token,
    datasources,
  );

  if (token) {
    builder.setToken(token);
  }
  if (datasources) {
    for (const [name, ds] of Object.entries(datasources)) {
      builder.addDataSource(name, ds as Record<string, unknown>);
    }
  }

  return builder.build();
}
