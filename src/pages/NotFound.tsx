import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p>Página no encontrada.</p>
      <p>
        <Link to="/">Volver al inicio</Link>
      </p>
    </section>
  );
}

