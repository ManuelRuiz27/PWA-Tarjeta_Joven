/**
 * Pequeño helper para manejar intentos de verificación OTP y cooldown de reenvío.
 */

export interface OtpState {
  attempts: number;
  lastSentAt: number | null; // epoch ms
}

export function createOtpManager(maxAttempts = 3, cooldownSec = 60) {
  const cooldownMs = cooldownSec * 1000;
  return {
    canAttempt(state: OtpState) {
      return state.attempts < maxAttempts;
    },
    recordAttempt(state: OtpState): OtpState {
      return { ...state, attempts: state.attempts + 1 };
    },
    canResend(state: OtpState, now = Date.now()) {
      if (state.lastSentAt == null) return true;
      return now - state.lastSentAt >= cooldownMs;
    },
    recordResend(state: OtpState, now = Date.now()): OtpState {
      return { ...state, lastSentAt: now };
    },
    nextResendIn(state: OtpState, now = Date.now()) {
      if (state.lastSentAt == null) return 0;
      const remain = cooldownMs - (now - state.lastSentAt);
      return Math.max(0, Math.ceil(remain / 1000));
    },
  };
}

