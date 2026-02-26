/**
 * Document Name Validator.
 *
 * Validates document names used in Link-type document references for
 * APL, APLA, and APLT directives. Document names are interpolated into
 * `doc://alexa/apl/documents/<name>` URIs and must be restricted to
 * safe characters to prevent malformed URIs and path traversal.
 */

/**
 * Pattern for valid document names.
 *
 * Allowed characters:
 * - Alphanumeric (`a-z`, `A-Z`, `0-9`)
 * - Hyphens (`-`)
 * - Underscores (`_`)
 * - Periods (`.`) — but not leading, trailing, or consecutive
 *
 * Must be 1-128 characters long.
 */
const VALID_DOCUMENT_NAME_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
const MAX_DOCUMENT_NAME_LENGTH = 128;

/**
 * Validate a document name for use in a Link-type document reference.
 *
 * A valid document name:
 * - Is a non-empty string of 1–128 characters
 * - Contains only alphanumeric characters, hyphens, underscores, and periods
 * - Does not start or end with a period
 * - Does not contain consecutive periods (`..`), which could enable path traversal
 *
 * @param name The document name to validate.
 * @returns `true` if the name is valid.
 *
 * @example
 * ```typescript
 * isValidDocumentName("my-document");       // true
 * isValidDocumentName("my_doc_v2");         // true
 * isValidDocumentName("doc.v1.0");          // true
 * isValidDocumentName("../traversal");      // false
 * isValidDocumentName("has spaces");        // false
 * isValidDocumentName("");                  // false
 * ```
 */
export function isValidDocumentName(name: string): boolean {
  if (!name || name.length > MAX_DOCUMENT_NAME_LENGTH) {
    return false;
  }
  if (name.includes("..")) {
    return false;
  }
  return VALID_DOCUMENT_NAME_PATTERN.test(name);
}

/**
 * Validate a document name and throw a descriptive error if invalid.
 *
 * @param name The document name to validate.
 * @param documentType The type of document (e.g., "APL", "APLA") for the error message.
 * @throws Error if the document name is invalid.
 */
export function assertValidDocumentName(
  name: string,
  documentType: string,
): void {
  if (!name || typeof name !== "string") {
    throw new Error(
      `${documentType} document name is required and must be a non-empty string`,
    );
  }
  if (name.length > MAX_DOCUMENT_NAME_LENGTH) {
    throw new Error(
      `${documentType} document name must not exceed ${MAX_DOCUMENT_NAME_LENGTH} characters`,
    );
  }
  if (name.includes("..")) {
    throw new Error(
      `${documentType} document name must not contain ".." (path traversal)`,
    );
  }
  if (!VALID_DOCUMENT_NAME_PATTERN.test(name)) {
    throw new Error(
      `${documentType} document name "${name}" contains invalid characters. ` +
        `Only alphanumeric characters, hyphens, underscores, and periods are allowed.`,
    );
  }
}
