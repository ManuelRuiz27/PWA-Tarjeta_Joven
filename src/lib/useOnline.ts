import { useEffect, useState } from 'react';

/**
 * Hook para detectar estado de conexión del navegador.
 */
export function useOnline() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    function on() { setOnline(true); }
    function off() { setOnline(false); }
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return online;
}

