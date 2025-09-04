import { useEffect, useRef, useState } from 'react';
import TextInput from '@features/auth/components/TextInput';
import PasswordField from '@features/auth/components/PasswordField';
import { login } from '@features/auth/auth.api';
import { useAppDispatch } from '@app/hooks';
import { setTokens, setUser } from '@features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { loginSchema, type LoginValues } from '@features/auth/validation';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<LoginValues>({ curp: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginValues, string>>>({});
  const errorRegionRef = useRef<HTMLDivElement | null>(null);

  function validateField<K extends keyof LoginValues>(name: K, value: LoginValues[K]) {
    const res = loginSchema.pick({ [name]: true } as any).safeParse({ [name]: value });
    setErrors((prev) => ({ ...prev, [name]: res.success ? undefined : res.error.issues[0]?.message }));
    return res.success;
  }

  function validateAll() {
    const res = loginSchema.safeParse(values);
    if (!res.success) {
      const e: any = {};
      for (const issue of res.error.issues) {
        const k = issue.path[0] as keyof LoginValues;
        e[k] = issue.message;
      }
      setErrors(e);
      // Focus primer error
      setTimeout(() => {
        const first = document.querySelector('[aria-invalid="true"]') as HTMLElement | null;
        first?.focus();
        errorRegionRef.current?.focus();
      }, 0);
    }
    return res.success;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNetworkError(null);
    if (!validateAll()) return;
    try {
      setLoading(true);
      const res = await login({ phone: values.curp, password: values.password });
      dispatch(setTokens({ tokens: res.tokens, user: res.user }));
      dispatch(setUser(res.user));
      navigate('/profile');
    } catch (err: any) {
      setNetworkError(err.message || 'Error de red');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Login</h1>
      {networkError && <p role="alert" style={{ color: 'crimson' }}>{networkError}</p>}
      <form onSubmit={onSubmit} noValidate>
        <div ref={errorRegionRef} tabIndex={-1} aria-live="assertive" />
        <TextInput
          label="CURP"
          value={values.curp}
          onChange={(e) => setValues((v) => ({ ...v, curp: e.currentTarget.value.toUpperCase() }))}
          onBlur={() => validateField('curp', values.curp)}
          error={errors.curp}
          placeholder="Ej. ABCD001231HDFRRS09"
        />
        <PasswordField
          label="Contraseña"
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.currentTarget.value }))}
          onBlur={() => validateField('password', values.password)}
          error={errors.password}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '...' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}
