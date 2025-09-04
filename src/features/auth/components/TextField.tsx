import { forwardRef, useId } from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Campo de texto accesible con etiqueta, mensaje de error y `aria-*`.
 */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const invalid = Boolean(error);
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={inputId} style={{ display: 'block', fontWeight: 600 }}>{label}</label>
      <input
        id={inputId}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        {...props}
        ref={ref}
        style={{ width: '100%', padding: 8, ...(props.style || {}) }}
      />
      {invalid && (
        <div id={errorId} role="alert" style={{ color: 'crimson', marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
});

export default TextField;
