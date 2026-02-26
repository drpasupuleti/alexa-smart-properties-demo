/**
 * APL Visual Context Parser.
 *
 * Provides utilities for extracting and interpreting the APL visual
 * context from skill requests. The visual context describes what was
 * visible on the screen when the user triggered the request.
 */

import {
  AlexaSkillRequest,
  VisibleComponent,
  ComponentTags,
  ListTag,
  MediaTag,
  PagerTag,
  ScrollableTag,
} from "../types/common";
import { APLVisualContext } from "../types/visual-context";

// ===========================================================================
// Visual context extraction
// ===========================================================================

/**
 * Extract the APL visual context from a skill request.
 * Returns undefined if no visual context is present.
 */
export function getVisualContext(
  request: AlexaSkillRequest,
): APLVisualContext | undefined {
  return request.context["Alexa.Presentation.APL"] as
    | APLVisualContext
    | undefined;
}

/**
 * Extract the document token from the visual context.
 */
export function getVisualContextToken(
  request: AlexaSkillRequest,
): string | undefined {
  const ctx = getVisualContext(request);
  return ctx?.token;
}

/**
 * Extract the APL runtime version from the visual context.
 */
export function getVisualContextVersion(
  request: AlexaSkillRequest,
): string | undefined {
  const ctx = getVisualContext(request);
  return ctx?.version;
}

/**
 * Get the list of components visible on screen.
 */
export function getComponentsVisibleOnScreen(
  request: AlexaSkillRequest,
): VisibleComponent[] {
  const ctx = getVisualContext(request);
  return ctx?.componentsVisibleOnScreen ?? [];
}

// ===========================================================================
// Component search utilities
// ===========================================================================

/**
 * Find a visible component by its id (the component id set in the APL document).
 * Searches the entire hierarchy recursively.
 */
export function findComponentById(
  components: VisibleComponent[],
  id: string,
): VisibleComponent | undefined {
  for (const component of components) {
    if (component.id === id) {
      return component;
    }
    if (component.children) {
      const found = findComponentById(component.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Find a visible component by its uid (runtime-generated unique id).
 */
export function findComponentByUid(
  components: VisibleComponent[],
  uid: string,
): VisibleComponent | undefined {
  for (const component of components) {
    if (component.uid === uid) {
      return component;
    }
    if (component.children) {
      const found = findComponentByUid(component.children, uid);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Find all components that match a predicate.
 */
export function findComponents(
  components: VisibleComponent[],
  predicate: (component: VisibleComponent) => boolean,
): VisibleComponent[] {
  const results: VisibleComponent[] = [];
  for (const component of components) {
    if (predicate(component)) {
      results.push(component);
    }
    if (component.children) {
      results.push(...findComponents(component.children, predicate));
    }
  }
  return results;
}

/**
 * Find all clickable (touchable) components.
 */
export function findClickableComponents(
  components: VisibleComponent[],
): VisibleComponent[] {
  return findComponents(components, (c) => c.tags?.clickable === true);
}

/**
 * Find all focused components.
 */
export function findFocusedComponents(
  components: VisibleComponent[],
): VisibleComponent[] {
  return findComponents(components, (c) => c.tags?.focused === true);
}

/**
 * Find all checked components.
 */
export function findCheckedComponents(
  components: VisibleComponent[],
): VisibleComponent[] {
  return findComponents(components, (c) => c.tags?.checked === true);
}

/**
 * Find all disabled components.
 */
export function findDisabledComponents(
  components: VisibleComponent[],
): VisibleComponent[] {
  return findComponents(components, (c) => c.tags?.disabled === true);
}

// ===========================================================================
// Tag extraction utilities
// ===========================================================================

/**
 * Get the list tag from a component (present on Sequence/GridSequence).
 */
export function getListTag(component: VisibleComponent): ListTag | undefined {
  return component.tags?.list;
}

/**
 * Get the media tag from a component (present on Video components).
 */
export function getMediaTag(component: VisibleComponent): MediaTag | undefined {
  return component.tags?.media;
}

/**
 * Get the pager tag from a component.
 */
export function getPagerTag(component: VisibleComponent): PagerTag | undefined {
  return component.tags?.pager;
}

/**
 * Get the scrollable tag from a component.
 */
export function getScrollableTag(
  component: VisibleComponent,
): ScrollableTag | undefined {
  return component.tags?.scrollable;
}

/**
 * Get the ordinal value from a component.
 */
export function getOrdinal(component: VisibleComponent): number | undefined {
  return component.tags?.ordinal;
}

// ===========================================================================
// Position parsing
// ===========================================================================

export interface ParsedPosition {
  width: number;
  height: number;
  x: number;
  y: number;
  layer: number;
}

/**
 * Parse the position string from a visible component.
 * Format: "WxH+X+Y:L" or "WxH-X-Y:L"
 *
 * @example parsePosition("960x480+0+0:0")
 * // => { width: 960, height: 480, x: 0, y: 0, layer: 0 }
 *
 * @example parsePosition("273x76+344+360:0")
 * // => { width: 273, height: 76, x: 344, y: 360, layer: 0 }
 */
export function parsePosition(positionStr: string): ParsedPosition {
  // Pattern: WxH[+-]X[+-]Y:L
  const match = positionStr.match(/^(\d+)x(\d+)([+-]\d+)([+-]\d+):(\d+)$/);
  if (!match) {
    throw new Error(`Invalid position format: "${positionStr}"`);
  }

  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10),
    x: parseInt(match[3], 10),
    y: parseInt(match[4], 10),
    layer: parseInt(match[5], 10),
  };
}

/**
 * Encode a position object back to a position string.
 */
export function encodePosition(position: ParsedPosition): string {
  const xSign = position.x >= 0 ? "+" : "";
  const ySign = position.y >= 0 ? "+" : "";
  return `${position.width}x${position.height}${xSign}${position.x}${ySign}${position.y}:${position.layer}`;
}

// ===========================================================================
// Visibility utilities
// ===========================================================================

/**
 * Get the effective visibility of a component.
 * The visibility property is omitted when it's 1.0 (fully visible).
 */
export function getEffectiveVisibility(component: VisibleComponent): number {
  return component.visibility ?? 1.0;
}

/**
 * Check if a component is fully visible (visibility === 1.0).
 */
export function isFullyVisible(component: VisibleComponent): boolean {
  return getEffectiveVisibility(component) === 1.0;
}

/**
 * Check if a component is partially visible.
 */
export function isPartiallyVisible(component: VisibleComponent): boolean {
  const vis = getEffectiveVisibility(component);
  return vis > 0 && vis < 1.0;
}

/**
 * Flatten the component hierarchy into a single array.
 */
export function flattenComponents(
  components: VisibleComponent[],
): VisibleComponent[] {
  const result: VisibleComponent[] = [];
  for (const component of components) {
    result.push(component);
    if (component.children) {
      result.push(...flattenComponents(component.children));
    }
  }
  return result;
}
