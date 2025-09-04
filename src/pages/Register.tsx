import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import TextField from '@features/auth/components/TextField';
import PasswordField from '@features/auth/components/PasswordField';
import FileInput from '@features/auth/components/FileInput';
import OTPInput from '@app/components/OTPInput';
import { getAgeFromCurp, isValidCurp } from '@features/auth/utils/curp';
import { createOtpManager } from '@features/auth/utils/otpManager';
import { registerForm, verifySms } from '@features/auth/auth.api';
import { useAppDispatch } from '@app/hooks';
import { setTokens, setUser } from '@features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { registerSchema, type RegisterValues } from '@features/auth/validation';

type Step = 'form' | 'otp' | 'done';

export default function Register() {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Campos del formulario principal
  const [curp, setCurp] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');
  const [tutorIne, setTutorIne] = useState<File | null>(null);

  // Errores
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstErrorRef = useRef<HTMLInputElement | null>(null);

  // Paso OTP
  const [step, setStep] = useState<Step>('form');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Intentos y cooldown
  const otpHelper = useMemo(() => createOtpManager(3, 60), []);
  const [otpState, setOtpState] = useState({ attempts: 0, lastSentAt: null as number | null });

  const age = useMemo(() => getAgeFromCurp(curp) ?? undefined, [curp]);
  const isMinor = age !== undefined && age < 18;

  // Enfoque en el primer error cuando valide
  useEffect(() => {
    if (firstErrorRef.current) {
      firstErrorRef.current.focus();
      firstErrorRef.current = null;
    }
  }, [errors]);

  function validate(): boolean {
    const res = registerSchema.safeParse({ curp: curp.trim().toUpperCase(), phone, password, tutorName, tutorPhone, tutorIne });
    if (!res.success) {
      const e: Record<string, string> = {};
      for (const issue of res.error.issues) {
        const k = String(issue.path[0]);
        e[k] = issue.message;
      }
      setErrors(e);
      setTimeout(() => {
        const first = document.querySelector('[aria-invalid="true"]') as HTMLElement | null;
        first?.focus();
      }, 0);
      return false;
    }
    setErrors({});
    return true;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNetworkError(null);
    if (!validate()) return;
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('curp', curp.trim().toUpperCase());
      fd.append('phone', phone);
      fd.append('password', password);
      if (isMinor) {
        fd.append('tutorName', tutorName);
        fd.append('tutorPhone', tutorPhone);
        if (tutorIne) fd.append('tutorIne', tutorIne);
      }
      await registerForm(fd);
      // Registrado: asumimos que el backend envió OTP; activamos cooldown
      setOtpState((s) => otpHelper.recordResend(s));
      setStep('otp');
      setTimeout(() => document.getElementById('otp-input')?.focus(), 0);
    } catch (err: any) {
      setNetworkError(err.message || intl.formatMessage({ id: 'register.error.network' }));
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp() {
    setOtpError(null);
    setNetworkError(null);
    if (!/^\d{6}$/.test(otp)) {
      setOtpError(intl.formatMessage({ defaultMessage: 'Ingresa un código de 6 dígitos.' }));
      return;
    }
    if (!otpHelper.canAttempt(otpState)) {
      setOtpError(intl.formatMessage({ defaultMessage: 'Has alcanzado el máximo de intentos.' }));
      return;
    }
    try {
      setLoading(true);
      const res = await verifySms({ phone, code: otp });
      // Guardamos autenticación y navegamos
      dispatch(setTokens({ tokens: res.tokens, user: res.user }));
      dispatch(setUser(res.user));
      setStep('done');
      navigate('/profile');
    } catch (err: any) {
      setOtpState((s) => otpHelper.recordAttempt(s));
      setOtpError(intl.formatMessage({ defaultMessage: 'Código incorrecto o expirado. Intenta nuevamente.' }));
    } finally {
      setLoading(false);
    }
  }

  function onResendOtp() {
    if (!otpHelper.canResend(otpState)) return;
    setOtp('');
    // En un escenario real, haríamos POST a /api/auth/resend-sms
    setOtpState((s) => otpHelper.recordResend(s));
  }

  const resendDisabled = !otpHelper.canResend(otpState);
  const resendIn = otpHelper.nextResendIn(otpState);
  const remainingAttempts = 3 - otpState.attempts;

  return (
    <section>
      <h1><FormattedMessage id="register.title" defaultMessage="Registro" /></h1>
      {networkError && (
        <div role="alert" style={{ color: 'crimson' }}>{networkError}</div>
      )}

      {step === 'form' && (
        <form onSubmit={onSubmit} noValidate>
          <TextField
            label={intl.formatMessage({ id: 'register.curp', defaultMessage: 'CURP' })}
            value={curp}
            onChange={(e) => setCurp(e.currentTarget.value.toUpperCase())}
            error={errors.curp}
            placeholder="Ej. ABCD001231HDFRRS09"
            aria-invalid={Boolean(errors.curp)}
            ref={(el: any) => {
              if (errors.curp && el) firstErrorRef.current = el;
            }}
          />
          <TextField
            label={intl.formatMessage({ id: 'register.phone', defaultMessage: 'Teléfono' })}
            value={phone}
            onChange={(e) => setPhone(e.currentTarget.value.replace(/[^\d+]/g, ''))}
            error={errors.phone}
            placeholder="10-15 dígitos"
            aria-invalid={Boolean(errors.phone)}
            ref={(el: any) => {
              if (errors.phone && el) firstErrorRef.current = el;
            }}
          />
          <PasswordField
            label={intl.formatMessage({ id: 'register.password', defaultMessage: 'Contraseña' })}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            error={errors.password}
          />

          {age !== undefined && (
            <p>Edad detectada: <strong>{age}</strong> años</p>
          )}

          {isMinor && (
            <fieldset style={{ border: '1px solid var(--color-border)', padding: 12 }}>
              <legend><FormattedMessage id="register.tutor" defaultMessage="Datos del tutor" /></legend>
              <TextField
                label={intl.formatMessage({ id: 'register.tutor.name', defaultMessage: 'Nombre del tutor' })}
                value={tutorName}
                onChange={(e) => setTutorName(e.currentTarget.value)}
                error={errors.tutorName}
              />
              <TextField
                label={intl.formatMessage({ id: 'register.tutor.phone', defaultMessage: 'Teléfono del tutor' })}
                value={tutorPhone}
                onChange={(e) => setTutorPhone(e.currentTarget.value.replace(/[^\d+]/g, ''))}
                error={errors.tutorPhone}
              />
              <FileInput
                label={intl.formatMessage({ id: 'register.tutor.ine', defaultMessage: 'INE del tutor (PDF/JPG, <4MB)' })}
                accept="application/pdf,image/jpeg"
                onChange={(e) => setTutorIne(e.currentTarget.files?.[0] ?? null)}
                error={errors.tutorIne}
              />
            </fieldset>
          )}

          <div style={{ marginTop: 12 }}>
            <button type="submit" disabled={loading}>{loading ? '...' : <FormattedMessage id="register.submit" defaultMessage="Registrarme" />}</button>
          </div>
        </form>
      )}

      {step === 'otp' && (
        <div>
          <h2><FormattedMessage id="register.sms.title" defaultMessage="Verificación SMS" /></h2>
          <p><FormattedMessage id="register.sms.hint" defaultMessage="Ingresa el código de 6 dígitos enviado a {phone}" values={{ phone }} /></p>
          <motion.div animate={otpError ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.35 }}>
            <OTPInput length={6} onComplete={setOtp} />
            {otpError && (
              <div role="alert" style={{ color: 'crimson', marginTop: 4 }}>{otpError}</div>
            )}
          </motion.div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onVerifyOtp} disabled={loading || !/^\d{6}$/.test(otp)}>
              {loading ? '...' : <FormattedMessage id="register.sms.verify" defaultMessage="Verificar" />}
            </button>
            <button onClick={onResendOtp} disabled={resendDisabled} aria-disabled={resendDisabled}>
              {resendDisabled ? <FormattedMessage id="register.sms.resendIn" defaultMessage="Reenviar en {seconds}s" values={{ seconds: resendIn }} /> : <FormattedMessage id="register.sms.resend" defaultMessage="Reenviar código" />}
            </button>
          </div>
          <p><FormattedMessage id="register.sms.remaining" defaultMessage="Intentos restantes: {n}" values={{ n: remainingAttempts }} /></p>
        </div>
      )}

      {step === 'done' && (
        <p>¡Registro y verificación completados!</p>
      )}
    </section>
  );
}
