import { useEffect, useId, useRef } from 'react';

interface OTPInputProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoFocus?: boolean;
  id?: string;
}

/**
 * Input de OTP de 6 dígitos con enfoque automático y validación básica.
 */
export default function OTPInput({ label = 'Código OTP', value, onChange, error, autoFocus, id: providedId }: OTPInputProps) {
  const genId = useId();
  const id = providedId ?? genId;
  const inputRef = useRef<HTMLInputElement>(null);
  const invalid = Boolean(error);
  const errorId = `${id}-error`;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={id} style={{ display: 'block', fontWeight: 600 }}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        inputMode="numeric"
        pattern="\\d{6}"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        style={{ width: '100%', padding: 8, letterSpacing: 4 }}
      />
      {invalid && (
        <div id={errorId} role="alert" style={{ color: 'crimson', marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
