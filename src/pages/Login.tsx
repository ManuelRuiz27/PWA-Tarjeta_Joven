import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@app/hooks';
import { setTokens, setUser } from '@features/auth/authSlice';
import { verifySms } from '@features/auth/auth.api';

const CURP_REGEX = new RegExp(
  '^(?:[A-Z][AEIOU][A-Z]{2})(?:\\d{2})(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])[HM]' +
    '(?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS)' +
    '(?:[B-DF-HJ-NP-TV-Z]{3})(?:[0-9A-Z])\\d$'
);
const OTP_REGEX = /^\d{6}$/;
const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 60;

function isValidCurp(value: string) {
  return CURP_REGEX.test(value.trim().toUpperCase());
}

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [curp, setCurp] = useState('');
  const [otp, setOtp] = useState('');
  const [curpError, setCurpError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [step, setStep] = useState<'idle' | 'codeSent'>('idle');
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const statusRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    if (networkError || curpError || otpError) {
      statusRegionRef.current?.focus();
    }
  }, [networkError, curpError, otpError]);

  const canRequestCode = useMemo(() => {
    if (!curp) return false;
    return isValidCurp(curp);
  }, [curp]);

  const attemptsLeft = MAX_ATTEMPTS - attempts;

  function validateCurp(value: string) {
    const normalized = value.trim().toUpperCase();
    setCurp(normalized);
    if (!normalized) {
      setCurpError('Ingresa tu CURP para continuar.');
      return false;
    }
    if (!isValidCurp(normalized)) {
      setCurpError('Verifica que tu CURP tenga 18 caracteres válidos.');
      return false;
    }
    setCurpError(null);
    return true;
  }

  function validateOtp(value: string) {
    if (!OTP_REGEX.test(value)) {
      setOtpError('Ingresa el código de 6 dígitos.');
      return false;
    }
    setOtpError(null);
    return true;
  }

  async function handleSendCode(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setNetworkError(null);
    const ok = validateCurp(curp);
    if (!ok) return;
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStep('codeSent');
      setCooldown(COOLDOWN_SECONDS);
      setStatusMessage('Te enviamos un código OTP a tu medio de contacto registrado.');
      setAttempts(0);
      setOtp('');
      setOtpError(null);
    } catch (err: any) {
      setNetworkError(err?.message || 'No pudimos enviar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNetworkError(null);
    if (!validateCurp(curp)) return;
    if (step !== 'codeSent') {
      setStatusMessage('Primero envía el código a tu teléfono o correo.');
      return;
    }
    if (attempts >= MAX_ATTEMPTS) {
      setOtpError('Has agotado los intentos. Solicita un nuevo código.');
      return;
    }
    if (!validateOtp(otp)) return;

    try {
      setLoading(true);
      const res = await verifySms({ phone: curp, code: otp });
      dispatch(setTokens({ tokens: res.tokens, user: res.user }));
      dispatch(setUser(res.user));
      navigate('/profile');
    } catch (err: any) {
      setAttempts((prev) => prev + 1);
      const remaining = attemptsLeft - 1;
      setOtpError(
        remaining > 0
          ? `Código incorrecto. Te quedan ${remaining} intento${remaining === 1 ? '' : 's'}.`
          : 'Has agotado los intentos. Solicita un nuevo código.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-shell" aria-labelledby="login-title">
      <header className="form-shell__header">
        <h1 id="login-title" className="form-shell__title">
          Iniciar sesión
        </h1>
        <p className="form-shell__subtitle">
          Ingresa tu CURP y utiliza el código de verificación temporal para continuar.
        </p>
      </header>

      <div
        ref={statusRegionRef}
        tabIndex={-1}
        aria-live="assertive"
        aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
      />

      {networkError && (
        <div className="alert alert--error" role="alert">
          {networkError}
        </div>
      )}

      {statusMessage && (
        <p className="status-text" aria-live="polite">
          {statusMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`field${curpError ? ' field--error' : ''}`}>
          <label htmlFor="curp" className="field__label">
            CURP
          </label>
          <input
            id="curp"
            name="curp"
            className="input-control"
            type="text"
            inputMode="text"
            autoComplete="off"
            value={curp}
            onChange={(event) => {
              const value = event.currentTarget.value.toUpperCase();
              setCurp(value);
              if (curpError) validateCurp(value);
            }}
            onBlur={(event) => validateCurp(event.currentTarget.value)}
            placeholder="Ej. ABCD001231HDFRRS09"
            aria-invalid={curpError ? 'true' : undefined}
            aria-describedby={curpError ? 'curp-error' : undefined}
            required
          />
          {curpError && (
            <p id="curp-error" className="field__error" role="alert">
              {curpError}
            </p>
          )}
        </div>

        <div className="form-footer">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSendCode}
            disabled={!canRequestCode || cooldown > 0 || loading}
            aria-disabled={!canRequestCode || cooldown > 0 || loading}
          >
            {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Enviar código'}
          </button>
          <p className="status-text">
            Este código expira en pocos minutos. Máximo {MAX_ATTEMPTS} intentos por sesión.
          </p>
        </div>

        <div className={`field${otpError ? ' field--error' : ''}`}>
          <label htmlFor="otp" className="field__label">
            Código OTP
          </label>
          <input
            id="otp"
            name="otp"
            className="input-control"
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={6}
            value={otp}
            onChange={(event) => {
              const digits = event.currentTarget.value.replace(/[^0-9]/g, '');
              setOtp(digits);
              if (otpError && OTP_REGEX.test(digits)) setOtpError(null);
            }}
            onBlur={(event) => {
              if (event.currentTarget.value) validateOtp(event.currentTarget.value);
            }}
            aria-invalid={otpError ? 'true' : undefined}
            aria-describedby={otpError ? 'otp-error' : undefined}
            disabled={step !== 'codeSent' || attempts >= MAX_ATTEMPTS}
            placeholder="Ingresa los 6 dígitos"
          />
          {otpError && (
            <p id="otp-error" className="field__error" role="alert">
              {otpError}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || attempts >= MAX_ATTEMPTS}>
          {loading ? 'Verificando…' : 'Ingresar'}
        </button>
      </form>
    </section>
  );
}
