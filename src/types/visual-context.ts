/**
 * APL Visual Context types.
 *
 * The visual context provides the skill with information about the content
 * displayed on the screen when the user invokes an intent or triggers
 * a user event.
 *
 * It provides both structural information (how components appear on screen)
 * and semantic information (what the components represent, via entities).
 */

import {
  VisibleComponent,
  ComponentTags,
  ListTag,
  ListItemTag,
  MediaTag,
  PagerTag,
  ScrollableTag,
  EntityData,
  VisibleComponentType,
} from "./common";

// Re-export all visual context types from common for convenience
export {
  VisibleComponent,
  ComponentTags,
  ListTag,
  ListItemTag,
  MediaTag,
  PagerTag,
  ScrollableTag,
  EntityData,
  VisibleComponentType,
};

/**
 * The full visual context object as it appears in the skill request
 * under `context['Alexa.Presentation.APL']`.
 */
export interface APLVisualContext {
  /** The token identifying the document displayed on the device. */
  token?: string;
  /** The version of the APL runtime that reported the visual context. */
  version?: string;
  /**
   * The elements that were visible on the screen when the user triggered
   * the request to the skill.
   */
  componentsVisibleOnScreen?: VisibleComponent[];
  /**
   * Present when this context represents a widget. Identifies the widget.
   */
  presentationUri?: string;
}

/**
 * Rules for determining the `type` of a visual context element based
 * on the component type.
 */
export const COMPONENT_TYPE_RULES: Record<
  string,
  VisibleComponentType | "children"
> = {
  Container: "children",
  EditText: "text",
  Frame: "children",
  FlexSequence: "children",
  GridSequence: "children",
  Image: "graphic",
  Pager: "children",
  ScrollView: "children",
  Sequence: "children",
  Text: "text",
  TouchWrapper: "children",
  VectorGraphic: "graphic",
  Video: "video",
};

/**
 * Combine two visual element types. The combination of any two different
 * types among text, graphic, video results in "mixed".
 */
export function combineTypes(
  a: VisibleComponentType,
  b: VisibleComponentType,
): VisibleComponentType {
  if (a === b) return a;
  if (a === "empty") return b;
  if (b === "empty") return a;
  return "mixed";
}
