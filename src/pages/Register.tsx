import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@app/hooks';
import { setTokens, setUser } from '@features/auth/authSlice';
import { registerForm } from '@features/auth/auth.api';
import InputFile from '@components/InputFile';

const CURP_REGEX = new RegExp(
  '^(?:[A-Z][AEIOU][A-Z]{2})(?:\\d{2})(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])[HM]' +
    '(?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS)' +
    '(?:[B-DF-HJ-NP-TV-Z]{3})(?:[0-9A-Z])\\d$'
);
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const BIRTHDATE_REGEX = new RegExp('^(\\d{2})\\/(\\d{2})\\/(\\d{4})$');
const FALLBACK_FILE_REGEX = /\.(pdf|png|jpe?g)$/i;

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  birthDate: string;
  curp: string;
  colony: string;
  ine: File | null;
  addressProof: File | null;
  curpDocument: File | null;
  terms: boolean;
}

type RegisterErrors = Partial<Record<keyof RegisterFormValues, string>>;

type ParsedDate = { day: number; month: number; year: number };

function parseBirthDate(value: string): ParsedDate | null {
  const match = BIRTHDATE_REGEX.exec(value.trim());
  if (!match) return null;
  const [_, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return { day, month, year };
}

function validateFile(file: File | null, label: string): string | undefined {
  if (!file) return `Adjunta ${label.toLowerCase()}.`;
  const isTypeValid = file.type ? ACCEPTED_TYPES.includes(file.type) : FALLBACK_FILE_REGEX.test(file.name);
  if (!isTypeValid) return 'Formato no permitido. Usa PDF, JPG o PNG.';
  if (file.size > MAX_FILE_SIZE) return 'El archivo debe pesar máximo 2MB.';
  return undefined;
}

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [values, setValues] = useState<RegisterFormValues>({
    firstName: '',
    lastName: '',
    birthDate: '',
    curp: '',
    colony: '',
    ine: null,
    addressProof: null,
    curpDocument: null,
    terms: false,
  });

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const statusRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (networkError) statusRegionRef.current?.focus();
  }, [networkError]);

  const age = useMemo(() => {
    const parsed = parseBirthDate(values.birthDate);
    if (!parsed) return null;
    const now = new Date();
    let ageYears = now.getFullYear() - parsed.year;
    const hasHadBirthday =
      now.getMonth() + 1 > parsed.month || (now.getMonth() + 1 === parsed.month && now.getDate() >= parsed.day);
    if (!hasHadBirthday) ageYears -= 1;
    return ageYears;
  }, [values.birthDate]);

  function setField<K extends keyof RegisterFormValues>(key: K, value: RegisterFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateAll(): boolean {
    const newErrors: RegisterErrors = {};
    if (!values.firstName.trim()) newErrors.firstName = 'Ingresa tu nombre.';
    if (!values.lastName.trim()) newErrors.lastName = 'Ingresa tus apellidos.';
    if (!values.birthDate.trim()) {
      newErrors.birthDate = 'Ingresa tu fecha de nacimiento.';
    } else if (!parseBirthDate(values.birthDate)) {
      newErrors.birthDate = 'Usa el formato DD/MM/AAAA.';
    }
    const curp = values.curp.trim().toUpperCase();
    if (!curp) {
      newErrors.curp = 'La CURP es obligatoria.';
    } else if (!CURP_REGEX.test(curp)) {
      newErrors.curp = 'Verifica que la CURP tenga 18 caracteres válidos.';
    }
    if (!values.colony.trim()) newErrors.colony = 'Indica tu colonia.';
    const ineError = validateFile(values.ine, 'tu INE');
    if (ineError) newErrors.ine = ineError;
    const proofError = validateFile(values.addressProof, 'tu comprobante de domicilio');
    if (proofError) newErrors.addressProof = proofError;
    const curpDocError = validateFile(values.curpDocument, 'tu CURP');
    if (curpDocError) newErrors.curpDocument = curpDocError;
    if (!values.terms) newErrors.terms = 'Debes aceptar los términos y avisos de privacidad.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      window.requestAnimationFrame(() => {
        const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        firstInvalid?.focus();
      });
      return false;
    }
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNetworkError(null);
    if (!validateAll()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('firstName', values.firstName.trim());
      formData.append('lastName', values.lastName.trim());
      formData.append('birthDate', values.birthDate.trim());
      formData.append('curp', values.curp.trim().toUpperCase());
      formData.append('colony', values.colony.trim());
      if (values.ine) formData.append('ine', values.ine);
      if (values.addressProof) formData.append('addressProof', values.addressProof);
      if (values.curpDocument) formData.append('curpDocument', values.curpDocument);
      formData.append('terms', String(values.terms));

      const response = await registerForm(formData);
      dispatch(setTokens({ tokens: response.tokens, user: response.user }));
      dispatch(setUser(response.user));
      navigate('/profile');
    } catch (err: any) {
      setNetworkError(err?.message || 'No pudimos completar el registro. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-shell" aria-labelledby="register-title">
      <header className="form-shell__header">
        <h1 id="register-title" className="form-shell__title">
          Crear cuenta Tarjeta Joven
        </h1>
        <p className="form-shell__subtitle">
          Completa tu información personal y adjunta los documentos solicitados para validar tu identidad.
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

      <form onSubmit={handleSubmit} noValidate className="grid-auto">
        <div className={`field${errors.firstName ? ' field--error' : ''}`}>
          <label htmlFor="firstName" className="field__label">
            Nombre(s)
          </label>
          <input
            id="firstName"
            name="firstName"
            className="input-control"
            value={values.firstName}
            onChange={(event) => setField('firstName', event.currentTarget.value)}
            aria-invalid={errors.firstName ? 'true' : undefined}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            placeholder="Ej. María Fernanda"
            required
          />
          {errors.firstName && (
            <p id="firstName-error" className="field__error" role="alert">
              {errors.firstName}
            </p>
          )}
        </div>

        <div className={`field${errors.lastName ? ' field--error' : ''}`}>
          <label htmlFor="lastName" className="field__label">
            Apellidos
          </label>
          <input
            id="lastName"
            name="lastName"
            className="input-control"
            value={values.lastName}
            onChange={(event) => setField('lastName', event.currentTarget.value)}
            aria-invalid={errors.lastName ? 'true' : undefined}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            placeholder="Ej. López Ramírez"
            required
          />
          {errors.lastName && (
            <p id="lastName-error" className="field__error" role="alert">
              {errors.lastName}
            </p>
          )}
        </div>

        <div className={`field${errors.birthDate ? ' field--error' : ''}`}>
          <label htmlFor="birthDate" className="field__label">
            Fecha de nacimiento
          </label>
          <input
            id="birthDate"
            name="birthDate"
            className="input-control"
            placeholder="DD/MM/AAAA"
            value={values.birthDate}
            onChange={(event) => setField('birthDate', event.currentTarget.value)}
            onBlur={(event) => {
              if (event.currentTarget.value && !parseBirthDate(event.currentTarget.value)) {
                setErrors((prev) => ({ ...prev, birthDate: 'Usa el formato DD/MM/AAAA.' }));
              }
            }}
            aria-invalid={errors.birthDate ? 'true' : undefined}
            aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
            inputMode="numeric"
            required
          />
          {age !== null && (
            <p className="field__hint" aria-live="polite">
              Edad calculada: {age} año{age === 1 ? '' : 's'}
            </p>
          )}
          {errors.birthDate && (
            <p id="birthDate-error" className="field__error" role="alert">
              {errors.birthDate}
            </p>
          )}
        </div>

        <div className={`field${errors.curp ? ' field--error' : ''}`}>
          <label htmlFor="curp" className="field__label">
            CURP
          </label>
          <input
            id="curp"
            name="curp"
            className="input-control"
            value={values.curp}
            onChange={(event) => setField('curp', event.currentTarget.value.toUpperCase())}
            onBlur={(event) => {
              const curp = event.currentTarget.value.trim().toUpperCase();
              if (curp && !CURP_REGEX.test(curp)) {
                setErrors((prev) => ({ ...prev, curp: 'Verifica que la CURP tenga 18 caracteres válidos.' }));
              }
            }}
            aria-invalid={errors.curp ? 'true' : undefined}
            aria-describedby={errors.curp ? 'curp-error' : undefined}
            placeholder="Ej. ABCD001231HDFRRS09"
            required
          />
          {errors.curp && (
            <p id="curp-error" className="field__error" role="alert">
              {errors.curp}
            </p>
          )}
        </div>

        <div className={`field${errors.colony ? ' field--error' : ''}`}>
          <label htmlFor="colony" className="field__label">
            Colonia
          </label>
          <input
            id="colony"
            name="colony"
            className="input-control"
            value={values.colony}
            onChange={(event) => setField('colony', event.currentTarget.value)}
            aria-invalid={errors.colony ? 'true' : undefined}
            aria-describedby={errors.colony ? 'colony-error' : undefined}
            placeholder="Ej. Centro"
            required
          />
          {errors.colony && (
            <p id="colony-error" className="field__error" role="alert">
              {errors.colony}
            </p>
          )}
        </div>

        <InputFile
          label="Adjuntar INE"
          value={values.ine}
          onChange={(file) => {
            setField('ine', file);
            const error = validateFile(file, 'tu INE');
            setErrors((prev) => ({ ...prev, ine: error }));
          }}
          accept={ACCEPTED_TYPES.join(',')}
          required
          error={errors.ine}
          hint="Archivo PDF, JPG o PNG (máx. 2MB)"
          name="ine"
        />

        <InputFile
          label="Adjuntar Comprobante de domicilio"
          value={values.addressProof}
          onChange={(file) => {
            setField('addressProof', file);
            const error = validateFile(file, 'tu comprobante de domicilio');
            setErrors((prev) => ({ ...prev, addressProof: error }));
          }}
          accept={ACCEPTED_TYPES.join(',')}
          required
          error={errors.addressProof}
          hint="Archivo PDF, JPG o PNG (máx. 2MB)"
          name="addressProof"
        />

        <InputFile
          label="Adjuntar CURP"
          value={values.curpDocument}
          onChange={(file) => {
            setField('curpDocument', file);
            const error = validateFile(file, 'tu CURP');
            setErrors((prev) => ({ ...prev, curpDocument: error }));
          }}
          accept={ACCEPTED_TYPES.join(',')}
          required
          error={errors.curpDocument}
          hint="Archivo PDF, JPG o PNG (máx. 2MB)"
          name="curpDocument"
        />

        <div className="checkbox">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={values.terms}
            onChange={(event) => setField('terms', event.currentTarget.checked)}
            aria-invalid={errors.terms ? 'true' : undefined}
            aria-describedby={errors.terms ? 'terms-error' : undefined}
            required
          />
          <label htmlFor="terms">
            Acepto los <a href="/docs/terminos" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a> y el{' '}
            <a href="/docs/privacidad" target="_blank" rel="noopener noreferrer">Aviso de Privacidad</a>.
          </label>
        </div>
        {errors.terms && (
          <p id="terms-error" className="field__error" role="alert">
            {errors.terms}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Enviando…' : 'Finalizar registro'}
        </button>
      </form>
    </section>
  );
}
