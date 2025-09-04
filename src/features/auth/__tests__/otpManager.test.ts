import { describe, expect, it, vi } from 'vitest';
import { createOtpManager, type OtpState } from '../utils/otpManager';

describe('OTP manager', () => {
  it('limita a 3 intentos', () => {
    const mgr = createOtpManager(3, 60);
    let s: OtpState = { attempts: 0, lastSentAt: null };
    expect(mgr.canAttempt(s)).toBe(true);
    s = mgr.recordAttempt(s);
    s = mgr.recordAttempt(s);
    s = mgr.recordAttempt(s);
    expect(mgr.canAttempt(s)).toBe(false);
  });

  it('aplica cooldown de reenvío de 60s', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);
    const mgr = createOtpManager(3, 60);
    let s: OtpState = { attempts: 0, lastSentAt: null };
    expect(mgr.canResend(s)).toBe(true);
    s = mgr.recordResend(s, now);
    expect(mgr.canResend(s, now)).toBe(false);
    // Avanza 59s
    vi.advanceTimersByTime(59_000);
    expect(mgr.canResend(s, now + 59_000)).toBe(false);
    // Avanza a 60s
    vi.advanceTimersByTime(1_000);
    expect(mgr.canResend(s, now + 60_000)).toBe(true);
    vi.useRealTimers();
  });
});

