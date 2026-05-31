/**
 * Formats a number or string into a thousand-separated string representation.
 * Example: 100000 -> "100,000"
 * Example: 100000.5 -> "100,000.5"
 *
 * @param value The raw number or string to format
 * @returns A formatted string with commas as thousands separators and dot as decimal separator
 */
export const formatThousand = (value: string | number): string => {
  if (value === undefined || value === null || value === '') return '';

  // Clean up all non-numeric/non-dot characters except leading minus if needed
  // We keep only digits and the first dot
  let cleanVal = value.toString().replace(/[^0-9.]/g, '');

  const parts = cleanVal.split('.');

  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Reconstruct with trailing decimal dot or decimal part
  if (parts.length > 1) {
    return `${parts[0]}.${parts.slice(1).join('')}`;
  }
  return parts[0];
};

/**
 * Parses a thousand-separated string back to a float number.
 * Example: "100,000" -> 100000
 * Example: "100,000.5" -> 100000.5
 *
 * @param value The formatted string to parse
 * @returns A parsed float number, or 0 if invalid
 */
export const parseThousand = (value: string): number => {
  if (!value) return 0;
  const cleanStr = value.replace(/,/g, '');
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
};
