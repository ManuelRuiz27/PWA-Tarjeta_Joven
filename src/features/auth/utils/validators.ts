import { isValidCurp } from './curp';

export const validateCurp = (curp: string) => {
  if (!curp || !isValidCurp(curp)) return 'CURP inválida. Verifica el formato.';
  return null;
};

export const validatePhone = (phone: string) => {
  if (!/^\+?\d{10,15}$/.test(phone || '')) return 'Teléfono inválido. Usa 10-15 dígitos.';
  return null;
};

export const validatePassword = (pwd: string) => {
  if (!pwd || pwd.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
};

export const validateTutorFile = (file: File | null | undefined) => {
  if (!file) return 'INE del tutor es requerida.';
  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
  if (!validTypes.includes(file.type)) return 'Formato inválido. Solo PDF o JPG.';
  const max = 4 * 1024 * 1024;
  if (file.size > max) return 'El archivo debe ser menor a 4MB.';
  return null;
};

