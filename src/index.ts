/**
 * Alexa Presentation Language (APL) Interface Reference — Implementation
 *
 * This library provides a complete TypeScript implementation of the
 * Alexa Presentation Language interface reference, covering:
 *
 * 1. **Alexa.Presentation.APL** — Directives and requests for screen devices
 *    - RenderDocument directive (inline & linked documents)
 *    - ExecuteCommands directive (standard documents & widgets)
 *    - SendIndexListData directive
 *    - SendTokenListData directive
 *    - UpdateIndexListData directive
 *    - UserEvent request
 *    - LoadIndexListData request
 *    - LoadTokenListData request
 *    - RuntimeError request
 *
 * 2. **Alexa.Presentation.APLA** — Directives and requests for audio
 *    - RenderDocument directive (inline & linked documents)
 *    - RuntimeError request
 *
 * 3. **Alexa.Presentation.APLT** — Directives and requests for character displays
 *    - RenderDocument directive
 *    - ExecuteCommands directive
 *
 * 4. **Alexa.DataStore** — Data store error notifications
 *    - DataStoreError request (DEVICE_UNAVAILABLE, DEVICE_PERMANENTLY_UNAVAILABLE,
 *      STORAGE_LIMIT_EXCEEDED, DATASTORE_INTERNAL_ERROR)
 *
 * 5. **Alexa.DataStore.PackageManager** — Package lifecycle management
 *    - UsagesInstalled request
 *    - UsagesRemoved request
 *    - UpdateRequest request
 *    - InstallationError request
 *
 * 6. **APL Visual Context** — Visual context in skill requests
 *    - Component hierarchy parsing
 *    - Tag extraction (list, pager, media, scrollable, etc.)
 *    - Position parsing
 *    - Visibility calculations
 *
 * 7. **Widget Information** — Widget context in skill requests
 *    - Widget visual context extraction
 *    - Installed packages detection
 *    - Widget request identification
 *
 * @module alexa-apl-interface
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export * from "./types";

// ---------------------------------------------------------------------------
// Directive Builders
// ---------------------------------------------------------------------------
export * from "./directives";

// ---------------------------------------------------------------------------
// Request Handlers
// ---------------------------------------------------------------------------
export * from "./handlers";

// ---------------------------------------------------------------------------
// Context Parsers
// ---------------------------------------------------------------------------
export * from "./context";

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------
export * from "./validators";

// ---------------------------------------------------------------------------
// Request Router
// ---------------------------------------------------------------------------
export * from "./router";
