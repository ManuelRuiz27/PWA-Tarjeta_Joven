import { z } from 'zod';
import { getAgeFromCurp, isValidCurp } from './utils/curp';

export const curpSchema = z
  .string({ required_error: 'La CURP es obligatoria.' })
  .transform((s) => s.trim().toUpperCase())
  .refine((s) => isValidCurp(s), 'CURP inválida. Verifica el formato.');

export const passwordSchema = z
  .string({ required_error: 'La contraseña es obligatoria.' })
  .min(6, 'La contraseña debe tener al menos 6 caracteres.');

export const phoneSchema = z
  .string({ required_error: 'El teléfono es obligatorio.' })
  .regex(/^\+?\d{10,15}$/, 'Teléfono inválido. Usa 10-15 dígitos.');

export const loginSchema = z.object({
  curp: curpSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    curp: curpSchema,
    phone: phoneSchema,
    password: passwordSchema,
    tutorName: z.string().optional(),
    tutorPhone: z.string().optional(),
    tutorIne: z.custom<File | null | undefined>().optional(),
  })
  .superRefine((data, ctx) => {
    const age = getAgeFromCurp(data.curp);
    if (age != null && age < 18) {
      if (!data.tutorName || !data.tutorName.trim()) {
        ctx.addIssue({ path: ['tutorName'], code: z.ZodIssueCode.custom, message: 'Nombre del tutor es requerido.' });
      }
      if (!data.tutorPhone || !/^\+?\d{10,15}$/.test(data.tutorPhone)) {
        ctx.addIssue({ path: ['tutorPhone'], code: z.ZodIssueCode.custom, message: 'Teléfono del tutor inválido.' });
      }
      const f = data.tutorIne as File | null | undefined;
      if (!f) {
        ctx.addIssue({ path: ['tutorIne'], code: z.ZodIssueCode.custom, message: 'INE del tutor es requerida.' });
      } else {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(f.type)) {
          ctx.addIssue({ path: ['tutorIne'], code: z.ZodIssueCode.custom, message: 'Formato inválido. Solo PDF o JPG.' });
        }
        const max = 4 * 1024 * 1024;
        if (f.size > max) {
          ctx.addIssue({ path: ['tutorIne'], code: z.ZodIssueCode.custom, message: 'El archivo debe ser menor a 4MB.' });
        }
      }
    }
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

