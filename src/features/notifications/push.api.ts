/** API para guardar/eliminar la suscripción en el backend */

export async function saveSubscription(sub: PushSubscription) {
  const res = await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => 'Error al suscribir'));
}

export async function deleteSubscription(endpoint?: string) {
  const res = await fetch('/api/notifications/subscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => 'Error al desuscribir'));
}

