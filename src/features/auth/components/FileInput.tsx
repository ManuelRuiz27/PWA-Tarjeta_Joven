import { useId } from 'react';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

/**
 * Input de archivo accesible, para INE del tutor. Valida tipo/tamaño externamente.
 */
export default function FileInput({ label, error, id, ...props }: FileInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const invalid = Boolean(error);
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={inputId} style={{ display: 'block', fontWeight: 600 }}>{label}</label>
      <input
        id={inputId}
        type="file"
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        {...props}
      />
      {invalid && (
        <div id={errorId} role="alert" style={{ color: 'crimson', marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}

