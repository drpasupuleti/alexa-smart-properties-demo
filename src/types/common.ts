/**
 * Common types shared across all APL interfaces.
 * These types represent the foundational structures used throughout
 * the Alexa Presentation Language interface reference.
 */

// ---------------------------------------------------------------------------
// Skill Request / Response envelope types
// ---------------------------------------------------------------------------

/**
 * Top-level structure of a request sent from Alexa to a skill.
 */
export interface AlexaSkillRequest {
  version: string;
  session: Session;
  context: RequestContext;
  request: Request;
}

/**
 * Session information included in the skill request.
 */
export interface Session {
  new?: boolean;
  sessionId?: string;
  application?: Application;
  attributes?: Record<string, unknown>;
  user?: User;
}

export interface Application {
  applicationId: string;
}

export interface User {
  userId: string;
  accessToken?: string;
  permissions?: { consentToken?: string };
}

/**
 * The context object included in every skill request. Contains information
 * about the device, supported interfaces, extensions, viewports, and
 * presentation state.
 */
export interface RequestContext {
  System: SystemContext;
  Viewport?: ViewportContext;
  Viewports?: ViewportObject[];
  Extensions?: ExtensionsContext;
  AudioPlayer?: AudioPlayerContext;
  "Alexa.Presentation.APL"?: APLPresentationContext;
  "Alexa.Presentation"?: AlexaPresentationArrayContext;
  "Alexa.DataStore.PackageManager"?: DataStorePackageManagerContext;
}

export interface SystemContext {
  device: DeviceContext;
  application?: Application;
  user?: User;
  apiEndpoint: string;
  apiAccessToken: string;
}

export interface DeviceContext {
  deviceId: string;
  supportedInterfaces: SupportedInterfaces;
}

/**
 * Map of interfaces supported by the user's device.
 * Each key is the interface name, and the value contains interface-specific
 * configuration such as runtime version information.
 *
 * Known interface keys have strongly-typed values. Any additional
 * interfaces not listed here can be accessed via the
 * `additionalInterfaces` property.
 */
export interface SupportedInterfaces {
  AudioPlayer?: Record<string, unknown>;
  VideoApp?: Record<string, unknown>;
  "Alexa.Presentation.APL"?: APLInterfaceSupport;
  "Alexa.Presentation.APLA"?: Record<string, unknown>;
  "Alexa.Presentation.APLT"?: APLTInterfaceSupport;
  "Alexa.Presentation.HTML"?: HTMLInterfaceSupport;
  [key: string]: unknown;
}

export interface HTMLInterfaceSupport {
  runtime?: {
    maxVersion?: string;
  };
}

export interface APLInterfaceSupport {
  runtime: {
    maxVersion: string;
  };
}

export interface APLTInterfaceSupport {
  runtime: {
    maxVersion: string;
  };
}

// ---------------------------------------------------------------------------
// Viewport types
// ---------------------------------------------------------------------------

/**
 * The legacy Viewport object (singular) in the request context.
 * Provides information about the primary viewport for the device.
 */
export interface ViewportContext {
  experiences: ViewportExperience[];
  shape: ViewportShape;
  pixelWidth: number;
  pixelHeight: number;
  dpi: number;
  currentPixelWidth: number;
  currentPixelHeight: number;
  touch: TouchType[];
  keyboard: KeyboardType[];
  video?: { codecs: string[] };
}

export interface ViewportExperience {
  canRotate: boolean;
  canResize: boolean;
}

export type ViewportShape = "RECTANGLE" | "ROUND";
export type TouchType = "SINGLE";
export type KeyboardType = "DIRECTION";

/**
 * An item in the Viewports array. Represents a viewport on the device.
 *
 * This is a discriminated union on the `type` field:
 * - `"APL"` → `APLViewportObject` with screen-specific properties
 * - `"APLT"` → `APLTViewportObject` with character display properties
 *
 * Use the `type` field to narrow:
 * ```typescript
 * if (viewport.type === "APL") {
 *   console.log(viewport.pixelWidth); // number
 * }
 * ```
 */
export type ViewportObject = APLViewportObject | APLTViewportObject;

/**
 * A screen viewport (Echo Show, Fire TV, etc.).
 * Contains pixel dimensions, touch/keyboard support, and video codecs.
 */
export interface APLViewportObject {
  id: string;
  type: "APL";
  experiences?: ViewportExperience[];
  shape?: ViewportShape;
  pixelWidth?: number;
  pixelHeight?: number;
  dpi?: number;
  currentPixelWidth?: number;
  currentPixelHeight?: number;
  touch?: TouchType[];
  keyboard?: KeyboardType[];
  video?: { codecs: string[] };
}

/**
 * A character display viewport (Echo Dot with clock, etc.).
 * Contains line dimensions, display format, and segment information.
 */
export interface APLTViewportObject {
  id: string;
  type: "APLT";
  supportedProfiles?: APLTProfile[];
  lineLength?: number;
  lineCount?: number;
  format?: APLTFormat;
  interSegments?: InterSegment[];
}

export type ViewportType = "APL" | "APLT";
export type APLTProfile = "FOUR_CHARACTER_CLOCK";
export type APLTFormat = "SEVEN_SEGMENT";

/**
 * Inter-segment character placement on a character display.
 * Identifies special characters (like the colon on a clock) between
 * standard character positions.
 */
export interface InterSegment {
  x: number;
  y: number;
  characters: string;
}

// ---------------------------------------------------------------------------
// Extensions context
// ---------------------------------------------------------------------------

/**
 * Extensions available on the device. Each key is the extension URI.
 * Only includes extensions that are both requested in the skill manifest
 * and supported by the device.
 */
export interface ExtensionsContext {
  available: Record<string, Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// AudioPlayer context
// ---------------------------------------------------------------------------

export interface AudioPlayerContext {
  playerActivity:
    | "IDLE"
    | "PLAYING"
    | "PAUSED"
    | "BUFFER_UNDERRUN"
    | "FINISHED"
    | "STOPPED";
  token?: string;
  offsetInMilliseconds?: number;
}

// ---------------------------------------------------------------------------
// APL Presentation Context (visual context)
// ---------------------------------------------------------------------------

/** Context object for `Alexa.Presentation.APL` in the request context. */
export interface APLPresentationContext {
  token?: string;
  version?: string;
  componentsVisibleOnScreen?: VisibleComponent[];
  presentationUri?: string;
}

/** Array-form presentation context used for widget visual context. */
export interface AlexaPresentationArrayContext {
  contexts?: APLPresentationContext[];
}

/** Context object for `Alexa.DataStore.PackageManager` in the request. */
export interface DataStorePackageManagerContext {
  installedPackages: InstalledPackage[];
}

export interface InstalledPackage {
  packageId: string;
  packageVersion: string;
}

// ---------------------------------------------------------------------------
// Visual Context component types
// ---------------------------------------------------------------------------

/**
 * An element reported in the visual context `componentsVisibleOnScreen` array.
 * Each element corresponds to a component in the APL document.
 */
export interface VisibleComponent {
  id?: string;
  uid: string;
  position: string;
  type: VisibleComponentType;
  tags?: ComponentTags;
  children?: VisibleComponent[];
  entities?: EntityData[];
  visibility?: number;
  transform?: number[];
  role?: string;
}

export type VisibleComponentType =
  | "graphic"
  | "text"
  | "mixed"
  | "video"
  | "empty";

export interface EntityData {
  id?: string;
  type?: string;
  value?: string;
}

// ---------------------------------------------------------------------------
// Component tags
// ---------------------------------------------------------------------------

export interface ComponentTags {
  viewport?: Record<string, unknown>;
  focused?: boolean;
  clickable?: boolean;
  checked?: boolean;
  disabled?: boolean;
  spoken?: boolean;
  ordinal?: number;
  list?: ListTag;
  listItem?: ListItemTag;
  media?: MediaTag;
  pager?: PagerTag;
  scrollable?: ScrollableTag;
}

export interface ListTag {
  itemCount: number;
  lowestIndexSeen: number;
  highestIndexSeen: number;
  lowestOrdinalSeen?: number;
  highestOrdinalSeen?: number;
}

export interface ListItemTag {
  index: number;
}

export interface MediaTag {
  allowAdjustSeekPositionForward: boolean;
  allowAdjustSeekPositionBackwards: boolean;
  allowNext: boolean;
  allowPrevious: boolean;
  audioTrack: "foreground" | "background" | "none";
  entities?: unknown[];
  muted: boolean;
  positionInMilliseconds: number;
  state: "idle" | "playing" | "paused";
  url: string;
}

export interface PagerTag {
  index: number;
  pageCount: number;
  allowForward: boolean;
  allowBackwards: boolean;
}

export interface ScrollableTag {
  direction: "horizontal" | "vertical";
  allowForward: boolean;
  allowBackwards: boolean;
}

// ---------------------------------------------------------------------------
// Base request type
// ---------------------------------------------------------------------------

export interface Request {
  type: string;
  requestId?: string;
  timestamp?: string;
  locale?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Standard response envelope
// ---------------------------------------------------------------------------

export interface AlexaSkillResponse {
  version: string;
  sessionAttributes?: Record<string, unknown>;
  response: ResponseBody;
}

export interface ResponseBody {
  outputSpeech?: OutputSpeech;
  card?: Card;
  reprompt?: Reprompt;
  directives?: Directive[];
  shouldEndSession?: boolean;
}

export interface OutputSpeech {
  type: "PlainText" | "SSML";
  text?: string;
  ssml?: string;
  playBehavior?: "ENQUEUE" | "REPLACE_ALL" | "REPLACE_ENQUEUED";
}

export interface Card {
  type: "Simple" | "Standard" | "LinkAccount";
  title?: string;
  content?: string;
  text?: string;
  image?: { smallImageUrl?: string; largeImageUrl?: string };
}

export interface Reprompt {
  outputSpeech?: OutputSpeech;
  directives?: Directive[];
}

/**
 * Base directive type. All APL directives extend this.
 */
export interface Directive {
  type: string;
  [key: string]: unknown;
}
