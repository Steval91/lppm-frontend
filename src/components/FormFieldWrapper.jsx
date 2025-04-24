import React from "react";

/**
 * Wrapper to prevent text selection and text cursor when clicking around form fields.
 * Useful for wrapping PrimeReact inputs like InputText, Password, etc.
 */
const FormFieldWrapper = ({ children, className = "" }) => {
  return (
    <div className={`cursor-default select-none ${className}`}>{children}</div>
  );
};

export default FormFieldWrapper;
