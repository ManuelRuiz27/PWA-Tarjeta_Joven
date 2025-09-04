import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  VerifySmsPayload,
} from './types';

const BASE_URL = '/api/auth';

/**
 * Realiza una petición HTTP tipada devolviendo JSON.
 * Lanza un error si la respuesta no es OK.
 */
async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Login con teléfono y contraseña.
 * Endpoint esperado: POST /api/auth/login
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>(`${BASE_URL}/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Registro de usuario.
 * Endpoint esperado: POST /api/auth/register
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>(`${BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Verificación OTP/SMS.
 * Endpoint esperado: POST /api/auth/verify-sms
 */
export async function verifySms(payload: VerifySmsPayload): Promise<AuthResponse> {
  return request<AuthResponse>(`${BASE_URL}/verify-sms`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Registro con FormData para adjuntar archivos (INE del tutor, etc.).
 */
export async function registerForm(formData: FormData): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<AuthResponse>;
}
