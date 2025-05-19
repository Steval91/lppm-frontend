import { z } from "zod";

/**
 * Validates a form object using the provided Zod schema.
 *
 * @param {object} schema - The Zod schema to validate against.
 * @param {object} data - The form data to validate.
 * @param {Function} setErrors - A function to update form errors (usually from useState).
 * @returns {boolean} - Returns true if valid, false if validation failed.
 */
export function validateWithZod(schema, data, setErrors) {
  try {
    schema.parse(data); // Attempt validation
    setErrors({}); // Clear previous errors if validation passes
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format errors into a { field: message } object
      const formattedErrors = {};
      error.errors.forEach((err) => {
        const path = err.path[0];
        formattedErrors[path] = err.message;
      });
      setErrors(formattedErrors); // Update state with formatted errors
      console.error("Zod validation error:", formattedErrors);
      return false;
    }

    // Handle unexpected errors (not Zod-related)
    console.error("Unexpected validation error:", error);
    return false;
  }
}
