/** Tipos de datos y contratos del módulo de autenticación */

/** Respuesta de tokens del backend */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch (segundos) de expiración del access token */
  expiresAt: number;
}

/** Información básica de usuario autenticado */
export interface AuthUser {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
}

/** Estado del slice de autenticación */
export interface AuthState {
  tokens: AuthTokens | null;
  user: AuthUser | null;
}

/** Payload para login por teléfono y contraseña */
export interface LoginPayload {
  phone: string;
  password: string;
}

/** Payload para registro */
export interface RegisterPayload {
  phone: string;
  password: string;
  name?: string;
  /** CURP del usuario (RFC) */
  curp?: string;
  /** Datos del tutor si es menor de edad */
  tutorName?: string;
  tutorPhone?: string;
}

/** Payload para verificación OTP/SMS */
export interface VerifySmsPayload {
  phone: string;
  code: string;
}

/** Respuesta genérica de auth (tokens + usuario) */
export interface AuthResponse {
  tokens: AuthTokens;
  user: AuthUser;
}
