/**
 * Widget Information types.
 *
 * When the skill includes a widget, a request sent to the skill might
 * include additional information about that widget. The details in a
 * given request depend on different factors, such as whether the widget
 * is installed on the user's device and whether the widget is in view.
 */

import { APLVisualContext } from "./visual-context";

/**
 * Widget visual context as found in the `Alexa.Presentation[contexts]`
 * array. Contains an `Alexa.Presentation.APL` object that represents
 * the visual context for a widget in view on the device.
 */
export interface WidgetContext {
  /**
   * URI that identifies the widget.
   */
  presentationUri: string;

  /**
   * APL visual context for the visible widget, using the same structure
   * as the standard visual context.
   */
  componentsVisibleOnScreen?: APLVisualContext["componentsVisibleOnScreen"];
}

/**
 * The `Alexa.Presentation` object in the request context when widgets
 * are present. Contains an array of widget contexts.
 */
export interface AlexaPresentationWidgetContexts {
  contexts: WidgetContext[];
}
