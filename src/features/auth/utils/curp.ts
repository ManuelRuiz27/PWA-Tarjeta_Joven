/**
 * Utilidades para validación de CURP y cálculo de edad.
 */

// Regex oficial aproximada para CURP (consonantes y estados válidos)
const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/;

/**
 * Valida el formato de una CURP (RFC) en mayúsculas.
 */
export function isValidCurp(curp: string): boolean {
  const value = curp.trim().toUpperCase();
  return CURP_REGEX.test(value);
}

/**
 * Extrae fecha de nacimiento (YYYY-MM-DD) desde CURP y calcula edad en años.
 * Si no es posible parsear, devuelve null.
 */
export function getAgeFromCurp(curp: string): number | null {
  const v = curp.trim().toUpperCase();
  if (v.length < 12) return null;
  const yy = Number(v.slice(4, 6));
  const mm = Number(v.slice(6, 8));
  const dd = Number(v.slice(8, 10));
  if (!mm || !dd) return null;
  const now = new Date();
  const currentYY = now.getFullYear() % 100;
  const century = yy <= currentYY ? 2000 : 1900;
  const year = century + yy;
  const birth = new Date(year, mm - 1, dd);
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

