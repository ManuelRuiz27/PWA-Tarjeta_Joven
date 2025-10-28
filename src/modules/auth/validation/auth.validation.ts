import * as Joi from 'joi';

const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TL|TS|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;

const fileSchema = Joi.any();

export const sendOtpSchema = Joi.object({
  curp: Joi.string()
    .trim()
    .uppercase()
    .pattern(CURP_REGEX)
    .required()
    .messages({
      'string.pattern.base': 'La CURP proporcionada no es valida',
      'string.empty': 'La CURP es obligatoria',
    }),
});

export const verifyOtpSchema = Joi.object({
  curp: Joi.string()
    .trim()
    .uppercase()
    .pattern(CURP_REGEX)
    .required()
    .messages({
      'string.pattern.base': 'La CURP proporcionada no es valida',
      'string.empty': 'La CURP es obligatoria',
    }),
  otp: Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .length(6)
    .required()
    .messages({
      'string.pattern.base': 'El codigo OTP debe contener 6 digitos numericos',
      'string.length': 'El codigo OTP debe tener exactamente 6 digitos',
      'string.empty': 'El codigo OTP es obligatorio',
    }),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().trim().required().messages({
    'string.empty': 'El token de refresco es obligatorio',
  }),
});

export const registerSchema = Joi.object({
  nombre: Joi.string().trim().min(1).required().messages({
    'string.base': 'El nombre debe ser una cadena',
    'string.empty': 'El nombre es obligatorio',
  }),
  apellidos: Joi.string().trim().min(1).required().messages({
    'string.base': 'Los apellidos deben ser una cadena',
    'string.empty': 'Los apellidos son obligatorios',
  }),
  fechaNacimiento: Joi.string()
    .trim()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'La fecha de nacimiento debe tener el formato DD/MM/AAAA',
      'string.empty': 'La fecha de nacimiento es obligatoria',
    }),
  curp: Joi.string()
    .trim()
    .uppercase()
    .pattern(CURP_REGEX)
    .required()
    .messages({
      'string.pattern.base': 'La CURP proporcionada no es valida',
      'string.empty': 'La CURP es obligatoria',
    }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'El correo electronico debe ser valido',
    'string.empty': 'El correo electronico es obligatorio',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.empty': 'La contraseña es obligatoria',
  }),
  colonia: Joi.string().trim().min(1).required().messages({
    'string.empty': 'La colonia es obligatoria',
  }),
  telefono: Joi.string().trim().empty('').default(null).optional(),
  municipio: Joi.string().trim().empty('').default(null).optional(),
  ine: fileSchema.required().messages({
    'any.required': 'El archivo ine es obligatorio',
  }),
  curpFile: fileSchema.required().messages({
    'any.required': 'El archivo curp es obligatorio',
  }),
  comprobante: fileSchema.required().messages({
    'any.required': 'El archivo comprobante es obligatorio',
  }),
  acepta_tc: Joi.boolean()
    .truthy('true')
    .truthy('1')
    .truthy(1)
    .required()
    .messages({
      'any.required': 'Debes aceptar los terminos y condiciones',
      'boolean.base': 'El campo acepta_tc debe ser verdadero',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'El correo electronico debe ser valido',
    'string.empty': 'El correo electronico es obligatorio',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.empty': 'La contraseña es obligatoria',
  }),
});
