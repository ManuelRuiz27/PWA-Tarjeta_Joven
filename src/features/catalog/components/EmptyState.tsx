export default function EmptyState({ message = 'No hay beneficios disponibles.' }: { message?: string }) {
  return (
    <div role="status" aria-live="polite" style={{ padding: 24, textAlign: 'center', color: '#666' }}>
      {message}
    </div>
  );
}
