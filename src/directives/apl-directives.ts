/**
 * Alexa.Presentation.APL directive builders.
 *
 * Provides factory functions and builder classes for constructing
 * APL directives to send back to Alexa in skill responses.
 */

import {
  APLDocument,
  APLDataSource,
  APLCommand,
  APLRenderDocumentDirective,
  APLExecuteCommandsDirective,
  APLSendIndexListDataDirective,
  APLSendTokenListDataDirective,
  APLUpdateIndexListDataDirective,
  IndexListOperation,
} from "../types/apl";
import { assertValidDocumentName } from "../validators/document-name-validator";

// ===========================================================================
// RenderDocument builder
// ===========================================================================

export class RenderDocumentDirectiveBuilder {
  private token: string = "";
  private document: APLDocument | null = null;
  private datasources: Record<string, APLDataSource | Record<string, unknown>> =
    {};
  private sources: Record<string, unknown> = {};

  /**
   * Set the token that uniquely identifies this document presentation.
   * The token is required and used to reference the document in subsequent
   * directives (e.g. ExecuteCommands).
   */
  setToken(token: string): this {
    this.token = token;
    return this;
  }

  /**
   * Set the APL document to render. The document can be either a full
   * inline APL document (type: "APL") or a link to a document saved
   * in the developer console (type: "Link").
   */
  setDocument(document: APLDocument): this {
    this.document = document;
    return this;
  }

  /**
   * Set a link to a document saved in the developer console.
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
    assertValidDocumentName(documentName, "APL");
    this.document = {
      type: "Link",
      src: `doc://alexa/apl/documents/${documentName}`,
    };
    return this;
  }

  /**
   * Add a data source to bind to the document.
   */
  addDataSource(
    name: string,
    dataSource: APLDataSource | Record<string, unknown>,
  ): this {
    this.datasources[name] = dataSource;
    return this;
  }

  /**
   * Add a named APLA document source (used for audio within APL documents).
   */
  addSource(name: string, source: Record<string, unknown>): this {
    this.sources[name] = source;
    return this;
  }

  /**
   * Build and return the RenderDocument directive.
   * @throws Error if required properties are missing.
   */
  build(): APLRenderDocumentDirective {
    if (!this.token) {
      throw new Error("APL RenderDocument directive requires a token");
    }
    if (!this.document) {
      throw new Error("APL RenderDocument directive requires a document");
    }

    const directive: APLRenderDocumentDirective = {
      type: "Alexa.Presentation.APL.RenderDocument",
      token: this.token,
      document: this.document,
    };

    if (Object.keys(this.datasources).length > 0) {
      directive.datasources = this.datasources;
    }

    if (Object.keys(this.sources).length > 0) {
      directive.sources = this.sources;
    }

    return directive;
  }
}

// ===========================================================================
// ExecuteCommands builder
// ===========================================================================

export class ExecuteCommandsDirectiveBuilder {
  private token?: string;
  private presentationUri?: string;
  private commands: APLCommand[] = [];

  /**
   * Set the token that identifies the currently rendered document.
   * Required when targeting a standard document.
   */
  setToken(token: string): this {
    this.token = token;
    return this;
  }

  /**
   * Set the presentation URI that identifies a widget.
   * Required when targeting a widget.
   */
  setPresentationUri(uri: string): this {
    this.presentationUri = uri;
    return this;
  }

  /**
   * Add a command to execute on the document.
   */
  addCommand(command: APLCommand): this {
    this.commands.push(command);
    return this;
  }

  /**
   * Add multiple commands to execute on the document.
   */
  addCommands(commands: APLCommand[]): this {
    this.commands.push(...commands);
    return this;
  }

  /**
   * Build and return the ExecuteCommands directive.
   * @throws Error if required properties are missing.
   */
  build(): APLExecuteCommandsDirective {
    if (!this.token && !this.presentationUri) {
      throw new Error(
        "APL ExecuteCommands directive requires either a token or presentationUri",
      );
    }
    if (this.commands.length === 0) {
      throw new Error(
        "APL ExecuteCommands directive requires at least one command",
      );
    }

    const directive: APLExecuteCommandsDirective = {
      type: "Alexa.Presentation.APL.ExecuteCommands",
      commands: this.commands,
    };

    if (this.token) {
      directive.token = this.token;
    }
    if (this.presentationUri) {
      directive.presentationUri = this.presentationUri;
    }

    return directive;
  }
}

// ===========================================================================
// SendIndexListData builder
// ===========================================================================

export class SendIndexListDataDirectiveBuilder {
  private token: string = "";
  private correlationToken?: string;
  private listId: string = "";
  private startIndex: number = 0;
  private items: Record<string, unknown>[] = [];
  private minimumInclusiveIndex?: number;
  private maximumExclusiveIndex?: number;
  private listVersion?: number;

  setToken(token: string): this {
    this.token = token;
    return this;
  }

  setCorrelationToken(correlationToken: string): this {
    this.correlationToken = correlationToken;
    return this;
  }

  setListId(listId: string): this {
    this.listId = listId;
    return this;
  }

  setStartIndex(startIndex: number): this {
    this.startIndex = startIndex;
    return this;
  }

  setItems(items: Record<string, unknown>[]): this {
    this.items = items;
    return this;
  }

  setMinimumInclusiveIndex(index: number): this {
    this.minimumInclusiveIndex = index;
    return this;
  }

  setMaximumExclusiveIndex(index: number): this {
    this.maximumExclusiveIndex = index;
    return this;
  }

  setListVersion(version: number): this {
    this.listVersion = version;
    return this;
  }

  build(): APLSendIndexListDataDirective {
    if (!this.token) {
      throw new Error("SendIndexListData directive requires a token");
    }
    if (!this.listId) {
      throw new Error("SendIndexListData directive requires a listId");
    }

    const directive: APLSendIndexListDataDirective = {
      type: "Alexa.Presentation.APL.SendIndexListData",
      token: this.token,
      listId: this.listId,
      startIndex: this.startIndex,
      items: this.items,
    };

    if (this.correlationToken !== undefined) {
      directive.correlationToken = this.correlationToken;
    }
    if (this.minimumInclusiveIndex !== undefined) {
      directive.minimumInclusiveIndex = this.minimumInclusiveIndex;
    }
    if (this.maximumExclusiveIndex !== undefined) {
      directive.maximumExclusiveIndex = this.maximumExclusiveIndex;
    }
    if (this.listVersion !== undefined) {
      directive.listVersion = this.listVersion;
    }

    return directive;
  }
}

// ===========================================================================
// SendTokenListData builder
// ===========================================================================

export class SendTokenListDataDirectiveBuilder {
  private token: string = "";
  private correlationToken?: string;
  private listId: string = "";
  private pageToken: string = "";
  private items: Record<string, unknown>[] = [];
  private nextPageToken?: string;
  private listVersion?: number;

  setToken(token: string): this {
    this.token = token;
    return this;
  }

  setCorrelationToken(correlationToken: string): this {
    this.correlationToken = correlationToken;
    return this;
  }

  setListId(listId: string): this {
    this.listId = listId;
    return this;
  }

  setPageToken(pageToken: string): this {
    this.pageToken = pageToken;
    return this;
  }

  setItems(items: Record<string, unknown>[]): this {
    this.items = items;
    return this;
  }

  setNextPageToken(token: string): this {
    this.nextPageToken = token;
    return this;
  }

  setListVersion(version: number): this {
    this.listVersion = version;
    return this;
  }

  build(): APLSendTokenListDataDirective {
    if (!this.token) {
      throw new Error("SendTokenListData directive requires a token");
    }
    if (!this.listId) {
      throw new Error("SendTokenListData directive requires a listId");
    }
    if (!this.pageToken) {
      throw new Error("SendTokenListData directive requires a pageToken");
    }

    const directive: APLSendTokenListDataDirective = {
      type: "Alexa.Presentation.APL.SendTokenListData",
      token: this.token,
      listId: this.listId,
      pageToken: this.pageToken,
      items: this.items,
    };

    if (this.correlationToken !== undefined) {
      directive.correlationToken = this.correlationToken;
    }
    if (this.nextPageToken !== undefined) {
      directive.nextPageToken = this.nextPageToken;
    }
    if (this.listVersion !== undefined) {
      directive.listVersion = this.listVersion;
    }

    return directive;
  }
}

// ===========================================================================
// UpdateIndexListData builder
// ===========================================================================

export class UpdateIndexListDataDirectiveBuilder {
  private token: string = "";
  private listId: string = "";
  private listVersion: number = 0;
  private operations: IndexListOperation[] = [];

  setToken(token: string): this {
    this.token = token;
    return this;
  }

  setListId(listId: string): this {
    this.listId = listId;
    return this;
  }

  setListVersion(version: number): this {
    this.listVersion = version;
    return this;
  }

  /**
   * Add an InsertItem operation.
   */
  insertItem(index: number, item: Record<string, unknown>): this {
    this.operations.push({ type: "InsertItem", index, item });
    return this;
  }

  /**
   * Add an InsertMultipleItems operation.
   */
  insertMultipleItems(index: number, items: Record<string, unknown>[]): this {
    this.operations.push({ type: "InsertMultipleItems", index, items });
    return this;
  }

  /**
   * Add a SetItem operation.
   */
  setItem(index: number, item: Record<string, unknown>): this {
    this.operations.push({ type: "SetItem", index, item });
    return this;
  }

  /**
   * Add a DeleteItem operation.
   */
  deleteItem(index: number): this {
    this.operations.push({ type: "DeleteItem", index });
    return this;
  }

  /**
   * Add a DeleteMultipleItems operation.
   */
  deleteMultipleItems(index: number, count: number): this {
    this.operations.push({ type: "DeleteMultipleItems", index, count });
    return this;
  }

  /**
   * Add a raw operation.
   */
  addOperation(operation: IndexListOperation): this {
    this.operations.push(operation);
    return this;
  }

  build(): APLUpdateIndexListDataDirective {
    if (!this.token) {
      throw new Error("UpdateIndexListData directive requires a token");
    }
    if (!this.listId) {
      throw new Error("UpdateIndexListData directive requires a listId");
    }
    if (this.operations.length === 0) {
      throw new Error(
        "UpdateIndexListData directive requires at least one operation",
      );
    }

    return {
      type: "Alexa.Presentation.APL.UpdateIndexListData",
      token: this.token,
      listId: this.listId,
      listVersion: this.listVersion,
      operations: this.operations,
    };
  }
}

// ===========================================================================
// Convenience factory functions
// ===========================================================================

/**
 * Create a RenderDocument directive from a full APL document.
 *
 * Validates all required fields before returning the directive.
 * @throws Error if `token` is empty or `document` is missing.
 */
export function createRenderDocumentDirective(
  token: string,
  document: APLDocument,
  datasources?: Record<string, APLDataSource | Record<string, unknown>>,
): APLRenderDocumentDirective {
  const builder = new RenderDocumentDirectiveBuilder()
    .setToken(token)
    .setDocument(document);

  if (datasources) {
    for (const [name, ds] of Object.entries(datasources)) {
      builder.addDataSource(name, ds);
    }
  }

  return builder.build();
}

/**
 * Create a RenderDocument directive from a linked document name.
 *
 * The document name is validated to contain only safe characters.
 * @throws Error if `token` is empty or `documentName` is invalid.
 */
export function createLinkedRenderDocumentDirective(
  token: string,
  documentName: string,
  datasources?: Record<string, APLDataSource | Record<string, unknown>>,
): APLRenderDocumentDirective {
  assertValidDocumentName(documentName, "APL");
  return createRenderDocumentDirective(
    token,
    { type: "Link", src: `doc://alexa/apl/documents/${documentName}` },
    datasources,
  );
}

/**
 * Create an ExecuteCommands directive.
 *
 * Validates all required fields before returning the directive.
 * @throws Error if `token` is empty or `commands` is empty.
 */
export function createExecuteCommandsDirective(
  token: string,
  commands: APLCommand[],
): APLExecuteCommandsDirective {
  return new ExecuteCommandsDirectiveBuilder()
    .setToken(token)
    .addCommands(commands)
    .build();
}

/**
 * Create an ExecuteCommands directive targeting a widget.
 *
 * Validates all required fields before returning the directive.
 * @throws Error if `presentationUri` is empty or `commands` is empty.
 */
export function createWidgetExecuteCommandsDirective(
  presentationUri: string,
  commands: APLCommand[],
): APLExecuteCommandsDirective {
  return new ExecuteCommandsDirectiveBuilder()
    .setPresentationUri(presentationUri)
    .addCommands(commands)
    .build();
}
