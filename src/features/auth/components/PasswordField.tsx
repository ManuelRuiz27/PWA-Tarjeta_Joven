import { useState } from 'react';
import TextField, { TextFieldProps } from './TextField';

export default function PasswordField(props: Omit<TextFieldProps, 'type'>) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <TextField
        {...props}
        type={show ? 'text' : 'password'}
      />
      <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show}>
        {show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      </button>
    </div>
  );
}

