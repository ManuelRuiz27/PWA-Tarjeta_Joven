import { describe, expect, it } from 'vitest';
import { getAgeFromCurp, isValidCurp } from '../utils/curp';

describe('CURP utils', () => {
  it('valida formato de CURP correcto', () => {
    // CURP de ejemplo válida (común en documentación):
    const curp = 'GODE561231HDFRRN09';
    expect(isValidCurp(curp)).toBe(true);
  });

  it('rechaza CURP inválida', () => {
    expect(isValidCurp('INVALIDA123')).toBe(false);
  });

  it('calcula edad desde CURP', () => {
    const curp = 'GODE561231HDFRRN09';
    const age = getAgeFromCurp(curp);
    expect(age).not.toBeNull();
    if (age != null) {
      expect(age).toBeGreaterThan(0);
      expect(age).toBeLessThan(150);
    }
  });
});

