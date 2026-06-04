import { formatThousand } from './format';

/**
 * Formats numbers inside a mathematical expression with thousand separators
 * and standardizes spacing around operators.
 * Example: "20000+15000*2" -> "20,000 + 15,000 × 2"
 */
export const formatExpression = (expr: string): string => {
  if (expr === undefined || expr === null || expr === '') return '';

  // Clean all commas and standardize display operators
  let clean = expr.replace(/,/g, '').replace(/\*/g, '×').replace(/\//g, '÷');
  
  // Remove all spaces to format cleanly
  clean = clean.replace(/\s+/g, '');
  
  // Add spaces around operator symbols: +, -, ×, ÷
  clean = clean.replace(/([+\-×÷])/g, ' $1 ');
  
  // Format each number group (integers or decimals)
  const formatted = clean.replace(/\d+(\.\d+)?/g, (match) => {
    return formatThousand(match);
  });
  
  // Clean double spaces and trim
  return formatted.replace(/\s+/g, ' ').trim();
};

/**
 * Evaluates a mathematical expression safely.
 * Returns the computed number, or 0 if invalid.
 */
export const evaluateExpression = (expr: string): number => {
  if (!expr) return 0;
  
  // Remove commas
  let raw = expr.replace(/,/g, '');
  
  // Replace display operators with javascript operators
  raw = raw.replace(/×/g, '*').replace(/÷/g, '/');
  
  // Strip characters that are not numbers, operators, dots, or parentheses
  const sanitized = raw.replace(/[^0-9+\-*/().]/g, '');
  
  try {
    let evalStr = sanitized.trim();
    
    // Strip trailing operator for evaluation if user is in the middle of typing
    while (/[+\-*/.]$/.test(evalStr)) {
      evalStr = evalStr.slice(0, -1).trim();
    }
    
    if (evalStr) {
      // Validate that it only contains numbers, operators, dots, and parentheses
      if (/^[0-9+\-*/().]+$/.test(evalStr)) {
        const result = new Function(`return ${evalStr}`)();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
          return Math.max(0, result);
        }
      }
    }
  } catch (e) {
    // Fail silently on syntax/parse errors (e.g. unclosed parenthesis)
  }
  return 0;
};
