/**
 * Alexa.Presentation.APL Interface types.
 *
 * Provides directives and requests for working with devices with screens
 * (e.g. Echo Show). Used with APL documents.
 *
 * Directives:
 *   - RenderDocument
 *   - ExecuteCommands
 *   - SendIndexListData
 *   - SendTokenListData
 *   - UpdateIndexListData
 *
 * Requests:
 *   - UserEvent
 *   - LoadIndexListData
 *   - LoadTokenListData
 *   - RuntimeError
 */

import { Directive, Request } from "./common";

// ===========================================================================
// APL Document types
// ===========================================================================

/**
 * An APL document for screen devices.
 * When `type` is "APL", the document contains the full JSON structure.
 * When `type` is "Link", `src` references a document saved in the authoring tool.
 */
export interface APLDocument {
  type: "APL" | "Link";
  version?: string;
  src?: string;
  description?: string;
  theme?: string;
  import?: APLImport[];
  resources?: APLResource[];
  styles?: Record<string, unknown>;
  layouts?: Record<string, unknown>;
  mainTemplate?: APLMainTemplate;
  onMount?: APLCommand[];
  settings?: Record<string, unknown>;
  extensions?: APLExtensionRequest[];
  [key: string]: unknown;
}

export interface APLImport {
  name: string;
  version: string;
  source?: string;
}

export interface APLResource {
  description?: string;
  when?: string;
  booleans?: Record<string, boolean>;
  numbers?: Record<string, number>;
  strings?: Record<string, string>;
  colors?: Record<string, string>;
  dimensions?: Record<string, string | number>;
  gradients?: Record<string, unknown>;
  easing?: Record<string, unknown>;
}

export interface APLMainTemplate {
  parameters?: string[];
  items?: APLComponent[];
  item?: APLComponent;
}

export interface APLExtensionRequest {
  name: string;
  uri: string;
}

// ===========================================================================
// APL Component types
// ===========================================================================

/**
 * Base APL component. All components share these common properties.
 */
export interface APLComponent {
  type: string;
  id?: string;
  when?: boolean | string;
  description?: string;
  checked?: boolean;
  disabled?: boolean;
  display?: "normal" | "invisible" | "none";
  entities?: Array<{ id?: string; type?: string; value?: string }>;
  height?: string | number;
  width?: string | number;
  minHeight?: string | number;
  minWidth?: string | number;
  maxHeight?: string | number;
  maxWidth?: string | number;
  opacity?: number;
  padding?: (string | number)[];
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  paddingTop?: string | number;
  role?: string;
  speech?: string;
  style?: string;
  transform?: APLTransform[];
  bind?: APLBind[];
  items?: APLComponent[];
  item?: APLComponent[];
  [key: string]: unknown;
}

export interface APLTransform {
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  scale?: number;
  skewX?: number;
  skewY?: number;
  translateX?: string | number;
  translateY?: string | number;
}

export interface APLBind {
  name: string;
  value: unknown;
  type?: string;
}

// ===========================================================================
// APL Command types
// ===========================================================================

export interface APLCommand {
  type: string;
  description?: string;
  delay?: number;
  when?: boolean | string;
  screenLock?: boolean;
  sequencer?: string;
  [key: string]: unknown;
}

// ===========================================================================
// Data Source types
// ===========================================================================

/**
 * A data source provided to an APL document in the RenderDocument directive.
 * The APL runtime supports several data source types.
 */
export type APLDataSource =
  | ObjectDataSource
  | DynamicIndexListDataSource
  | DynamicTokenListDataSource;

export interface ObjectDataSource {
  type: "object";
  objectId?: string;
  properties?: Record<string, unknown>;
  transformers?: DataSourceTransformer[];
  [key: string]: unknown;
}

export interface DynamicIndexListDataSource {
  type: "dynamicIndexList";
  listId: string;
  startIndex: number;
  minimumInclusiveIndex?: number;
  maximumExclusiveIndex?: number;
  items: Record<string, unknown>[];
}

export interface DynamicTokenListDataSource {
  type: "dynamicTokenList";
  listId: string;
  pageToken: string;
  items: Record<string, unknown>[];
  forwardPageToken?: string;
  backwardPageToken?: string;
}

export interface DataSourceTransformer {
  transformer: string;
  inputPath: string;
  outputName: string;
}

// ===========================================================================
// DIRECTIVES
// ===========================================================================

// ---- RenderDocument -------------------------------------------------------

/**
 * Instructs the device to display the APL content provided in the specified
 * document. You can also optionally provide one or more datasources to bind
 * content to the document.
 */
export interface APLRenderDocumentDirective extends Directive {
  type: "Alexa.Presentation.APL.RenderDocument";
  token: string;
  document: APLDocument;
  datasources?: Record<string, APLDataSource | Record<string, unknown>>;
  sources?: Record<string, unknown>;
}

// ---- ExecuteCommands ------------------------------------------------------

/**
 * Instructs the device to run the provided commands on:
 * - Standard document – The currently rendered document identified by `token`.
 * - Widget – The installed widget identified by `presentationUri`.
 */
export interface APLExecuteCommandsDirective extends Directive {
  type: "Alexa.Presentation.APL.ExecuteCommands";
  token?: string;
  presentationUri?: string;
  commands: APLCommand[];
}

// ---- SendIndexListData ----------------------------------------------------

/**
 * Sends a new set of list items to display, in response to a
 * LoadIndexListData request. Include a dynamicIndexList data source
 * with the next set of items to display.
 */
export interface APLSendIndexListDataDirective extends Directive {
  type: "Alexa.Presentation.APL.SendIndexListData";
  token: string;
  correlationToken?: string;
  listId: string;
  startIndex: number;
  minimumInclusiveIndex?: number;
  maximumExclusiveIndex?: number;
  items: Record<string, unknown>[];
  listVersion?: number;
}

// ---- SendTokenListData ----------------------------------------------------

/**
 * Sends a new page of list items to display, in response to a
 * LoadTokenListData request. Include a dynamicTokenList data source
 * with the next page of items to display.
 */
export interface APLSendTokenListDataDirective extends Directive {
  type: "Alexa.Presentation.APL.SendTokenListData";
  token: string;
  correlationToken?: string;
  listId: string;
  pageToken: string;
  items: Record<string, unknown>[];
  nextPageToken?: string;
  listVersion?: number;
}

// ---- UpdateIndexListData --------------------------------------------------

/**
 * Sends a set of data operations to Alexa to insert, set, and delete
 * list items in a data source that has already been sent to the device.
 */
export interface APLUpdateIndexListDataDirective extends Directive {
  type: "Alexa.Presentation.APL.UpdateIndexListData";
  token: string;
  listId: string;
  listVersion: number;
  operations: IndexListOperation[];
}

export type IndexListOperation =
  | InsertItemOperation
  | InsertMultipleItemsOperation
  | SetItemOperation
  | DeleteItemOperation
  | DeleteMultipleItemsOperation;

export interface InsertItemOperation {
  type: "InsertItem";
  index: number;
  item: Record<string, unknown>;
}

export interface InsertMultipleItemsOperation {
  type: "InsertMultipleItems";
  index: number;
  items: Record<string, unknown>[];
}

export interface SetItemOperation {
  type: "SetItem";
  index: number;
  item: Record<string, unknown>;
}

export interface DeleteItemOperation {
  type: "DeleteItem";
  index: number;
}

export interface DeleteMultipleItemsOperation {
  type: "DeleteMultipleItems";
  index: number;
  count: number;
}

// ===========================================================================
// REQUESTS (incoming from Alexa to skill)
// ===========================================================================

// ---- UserEvent ------------------------------------------------------------

/**
 * Sent to the skill when the user interacts with a component in the APL
 * document that sends an event (e.g. via the SendEvent command).
 */
export interface APLUserEventRequest extends Request {
  type: "Alexa.Presentation.APL.UserEvent";
  token: string;
  arguments?: unknown[];
  source?: UserEventSource;
  components?: Record<string, unknown>;
}

export interface UserEventSource {
  type: string;
  handler: string;
  id?: string;
  uid?: string;
  value?: unknown;
}

// ---- LoadIndexListData ----------------------------------------------------

/**
 * Sent to the skill when the device needs more items from a
 * dynamicIndexList data source.
 */
export interface APLLoadIndexListDataRequest extends Request {
  type: "Alexa.Presentation.APL.LoadIndexListData";
  token: string;
  correlationToken: string;
  listId: string;
  startIndex: number;
  count: number;
}

// ---- LoadTokenListData ----------------------------------------------------

/**
 * Sent to the skill when the device needs the next or previous page
 * from a dynamicTokenList data source.
 */
export interface APLLoadTokenListDataRequest extends Request {
  type: "Alexa.Presentation.APL.LoadTokenListData";
  token: string;
  correlationToken: string;
  listId: string;
  pageToken: string;
}

// ---- RuntimeError ---------------------------------------------------------

/**
 * Sent to notify the skill about any errors that happened during
 * APL rendering or document processing.
 */
export interface APLRuntimeErrorRequest extends Request {
  type: "Alexa.Presentation.APL.RuntimeError";
  token: string;
  errors: APLRuntimeError[];
}

export interface APLRuntimeError {
  type: string;
  reason: string;
  message: string;
}
