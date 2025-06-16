const unicodeNonAlphaNumeric = /[^\p{L}\p{N}]+/gu;
const unicodeCamelCaseBoundary = /([\p{Ll}\p{N}])(\p{Lu})/gu;
const unicodeLetterDigitBoundary = /([\p{L}])([\p{N}])/gu;
const unicodeDigitLetterBoundary = /([\p{N}])([\p{L}])/gu;
const leadingTrailingHyphens = /^-+|-+$/g;
const leadingTrailingUnderscores = /^_+|_+$/g;

/**
 * Converts an input string into UPPER_SNAKE_CASE
 *
 * - Non-word characters are replaced with `_`
 * - Leading and trailing `_` are trimmed
 *
 * @param input - The string to convert
 * @returns A string in UPPER_SNAKE_CASE
 *
 * @example
 * toUpperSnakeCase("_example__")   // "EXAMPLE"
 * toUpperSnakeCase("example-42")   // "EXAMPLE_42"
 * toUpperSnakeCase("crème brûlée") // "CRÈME_BRÛLÉE"
 */
function toUpperSnakeCase(input: string): string {
  return input
    .normalize("NFC")
    .toUpperCase()
    .replace(unicodeNonAlphaNumeric, "_") // Replace non-word characters with underscores
    .replace(leadingTrailingUnderscores, ""); // Trim leading and trailing underscores
}

/**
 * Converts an input string into kebab-case
 *
 * - Lowercases all letters
 * - Separates words by a single hyphen
 * - Replaces non-alphanumeric characters by hyphens
 * - Removes leading and trailing hyphens
 *
 * @param input - The string to convert
 * @returns A string in kebab-case
 *
 * @example
 * toKebabCase("EXAMPLE")    // "example"
 * toKebabCase("example42")  // "example-42"
 * toKebabCase("example-42") // "example-42"
 */
function toKebabCase(input: string): string {
  return (
    input
      .normalize("NFC")
      // Insert a hyphen between camelCase boundaries
      .replace(unicodeCamelCaseBoundary, "$1-$2")
      // Insert a hyphen between digit-letter (and vice versa) boundaries
      .replace(unicodeLetterDigitBoundary, "$1-$2")
      .replace(unicodeDigitLetterBoundary, "$1-$2")
      // Replace non-alphanumeric characters with hyphens
      .replace(unicodeNonAlphaNumeric, "-")
      // Remove leading and trailing hyphens
      .replace(leadingTrailingHyphens, "")
      .toLowerCase()
  );
}

/**
 * Converts an input string into a valid UPPER_SNAKE_CASE enum key.
 *
 * Combines an input string with an optional prefix, sanitizing both into
 * UPPER_SNAKE_CASE. To ensure validity it prefixes an underscore if it starts
 * with a digit.
 *
 * @param input - The string to convert
 * @param prefix - Optional prefix to prepend to the key
 * @returns A valid enum key in UPPER_SNAKE_CASE
 *
 * @example
 * toEnumKey("example")            // "example"
 * toEnumKey("16/example", "icon") // "ICON_16_EXAMPLE"
 */
export function toEnumKey(input: string, prefix?: string): string {
  const sanitizedInput = toUpperSnakeCase(input);
  const sanitizedPrefix = prefix ? toUpperSnakeCase(prefix) : "";

  // If both parts are empty after sanitization, return fallback "_"
  if (!sanitizedInput && !sanitizedPrefix) {
    return "_";
  }

  const combined = [sanitizedPrefix, sanitizedInput]
    .filter((s) => s.length > 0)
    .join("_");

  return /^\d/.test(combined) ? `_${combined}` : combined;
}

/**
 * Converts an input string with an optional prefix, combining both into
 * kebab-case.
 *
 * @param input - The string to convert
 * @param prefix - Optional prefix to prepend to the value
 * @returns A valid enum value in kebab-case
 *
 * @example
 * toEnumValue("example")            // "example"
 * toEnumValue("16/example", "icon") // "icon-16-example"
 */
export function toEnumValue(input: string, prefix?: string): string {
  const sanitizedInput = toKebabCase(input);
  const sanitizedPrefix = prefix ? toKebabCase(prefix) : "";

  // If both parts are empty after sanitization, return fallback "-"
  if (!sanitizedInput && !sanitizedPrefix) {
    return "-";
  }

  return [sanitizedPrefix, sanitizedInput]
    .filter((s) => s.length > 0)
    .join("-");
}
