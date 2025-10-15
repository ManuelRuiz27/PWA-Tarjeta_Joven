import { useEffect, useMemo, useRef, useState } from 'react';

export interface OTPInputProps {
  /** Cantidad de celdas (recomendado 4–8). Default: 6 */
  length?: number;
  /** Deshabilita la interacción */
  disabled?: boolean;
  /** Se dispara cuando todas las celdas están completas */
  onComplete?: (code: string) => void;
  /** Prefijo de etiqueta accesible para cada dígito */
  ariaLabelPrefix?: string;
}

/**
 * OTPInput: N celdas con navegación por teclado (← →), Backspace inteligente, soporte de pegado completo
 * y lectura accesible por celda.
 */
export default function OTPInput({ length = 6, disabled = false, onComplete, ariaLabelPrefix = 'Dígito' }: OTPInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [values, setValues] = useState<string[]>(() => Array.from({ length }, () => ''));

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, length);
    if (values.length !== length) setValues(Array.from({ length }, () => ''));
  }, [length]);

  const code = useMemo(() => values.join(''), [values]);

  useEffect(() => {
    if (values.every((v) => v !== '')) onComplete?.(code);
  }, [values, code, onComplete]);

  function focusIndex(i: number) {
    const el = inputsRef.current[i];
    el?.focus();
    el?.select?.();
  }

  function handleChange(i: number, v: string) {
    if (disabled) return;
    const d = v.replace(/\D/g, '');
    if (!d) return;
    const next = [...values];
    next[i] = d.charAt(0);
    setValues(next);
    if (d.length > 1) {
      // Si se pegaron varios dígitos, propaga
      let idx = i + 1;
      for (let k = 1; k < d.length && idx < length; k++, idx++) {
        next[idx] = d.charAt(k);
      }
      setValues([...next]);
      focusIndex(Math.min(length - 1, i + d.length));
    } else if (i < length - 1) {
      focusIndex(i + 1);
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    const key = e.key;
    if (key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      focusIndex(i - 1);
    } else if (key === 'ArrowRight' && i < length - 1) {
      e.preventDefault();
      focusIndex(i + 1);
    } else if (key === 'Backspace') {
      e.preventDefault();
      const next = [...values];
      if (next[i]) {
        next[i] = '';
        setValues(next);
      } else if (i > 0) {
        next[i - 1] = '';
        setValues(next);
        focusIndex(i - 1);
      }
    }
  }

  function handlePaste(i: number, e: React.ClipboardEvent<HTMLInputElement>) {
    if (disabled) return;
    const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '');
    if (!text) return;
    e.preventDefault();
    const next = [...values];
    let idx = i;
    for (let k = 0; k < text.length && idx < length; k++, idx++) next[idx] = text.charAt(k);
    setValues(next);
    focusIndex(Math.min(length - 1, i + text.length));
  }

  return (
    <div role="group" aria-label="Código OTP" className="d-flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="\\d*"
          className="form-control text-center"
          style={{ width: 40 }}
          value={values[i] ?? ''}
          onChange={(e) => handleChange(i, e.currentTarget.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          aria-label={`${ariaLabelPrefix} ${i + 1} de ${length}`}
          aria-disabled={disabled}
          disabled={disabled}
          maxLength={1}
        />
      ))}
    </div>
  );
}
