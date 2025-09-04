export default function ErrorState({ message = 'Ocurrió un error al cargar el catálogo.' }: { message?: string }) {
  return (
    <div role="alert" style={{ padding: 24, textAlign: 'center', color: 'crimson' }}>
      {message}
    </div>
  );
}

