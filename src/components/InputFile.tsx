import { useId } from 'react';

interface InputFileProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  name?: string;
}

/**
 * Campo accesible para carga de archivos con estilos consistentes.
 */
export default function InputFile({
  label,
  value,
  onChange,
  accept,
  required,
  error,
  hint,
  name,
}: InputFileProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      <div className="file-input">
        <div className="btn btn-secondary file-input__button" aria-hidden="true">
          Seleccionar archivo
        </div>
        <span className="file-input__name" aria-live="polite">
          {value ? value.name : 'Ningún archivo seleccionado'}
        </span>
        <input
          type="file"
          id={id}
          name={name}
          accept={accept}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0] ?? null;
            onChange(file);
          }}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? 'true' : undefined}
          required={required}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
