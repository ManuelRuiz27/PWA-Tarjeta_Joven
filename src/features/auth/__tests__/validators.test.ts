import { describe, expect, it } from 'vitest';
import { validateCurp, validatePassword, validatePhone, validateTutorFile } from '../utils/validators';

describe('Validadores de formularios', () => {
  it('valida CURP', () => {
    expect(validateCurp('GODE561231HDFRRN09')).toBeNull();
    expect(validateCurp('INVALIDA')).toMatch(/CURP inválida/);
  });

  it('valida teléfono', () => {
    expect(validatePhone('5512345678')).toBeNull();
    expect(validatePhone('abc')).toMatch(/Teléfono inválido/);
  });

  it('valida contraseña', () => {
    expect(validatePassword('secret')).toBeNull();
    expect(validatePassword('123')).toMatch(/al menos 6/);
  });

  it('valida archivo de tutor', () => {
    const pdf = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    expect(validateTutorFile(pdf)).toBeNull();
    const bad = new File(['x'], 'doc.txt', { type: 'text/plain' });
    expect(validateTutorFile(bad)).toMatch(/Formato inválido/);
  });
});

