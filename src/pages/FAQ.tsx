import Accordion from '@features/help/components/Accordion';
import SupportTicketForm from '@features/help/components/SupportTicketForm';

/**
 * Página de preguntas frecuentes con acordeones accesibles y formulario para abrir tickets.
 */
export default function FAQPage() {
  const items = [
    {
      title: '¿Qué es Tarjeta Joven?',
      content: <p>Un programa de beneficios con descuentos y promociones para jóvenes.</p>,
      defaultOpen: true,
    },
    {
      title: '¿Cómo registro mi cuenta?',
      content: <p>Regístrate con tu CURP, verifica tu número con un SMS (OTP) y completa tus datos.</p>,
    },
    {
      title: '¿Cómo uso la Wallet?',
      content: <p>Guarda cupones en tu Wallet y muéstralos con el QR en comercios participantes.</p>,
    },
  ];

  return (
    <section>
      <h1>Preguntas frecuentes</h1>
      <Accordion items={items} />

      <h2 className="mt-4">Abrir ticket</h2>
      <p>¿No encontraste lo que buscabas? Envíanos tu consulta.</p>
      <SupportTicketForm />
    </section>
  );
}

