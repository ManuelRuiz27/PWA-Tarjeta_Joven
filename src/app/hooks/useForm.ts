import { useCallback, useMemo, useState } from 'react';

export type Validator<T> = (value: T, allValues: any) => string | null | undefined;

export function useForm<TValues extends Record<string, any>>(
  initialValues: TValues,
  validators: Partial<Record<keyof TValues, Validator<any>>> = {}
) {
  const [values, setValues] = useState<TValues>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    for (const key of Object.keys(values) as Array<keyof TValues>) {
      const v = validators[key]?.(values[key], values);
      if (typeof v === 'string' && v) e[key as string] = v;
    }
    return e;
  }, [values, validators]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = useCallback((name: keyof TValues, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((name: keyof TValues) => {
    setTouched((prev) => ({ ...prev, [name as string]: true }));
  }, []);

  const validateAll = useCallback(() => isValid, [isValid]);

  return { values, setValues, errors, touched, isValid, handleChange, handleBlur, validateAll };
}

