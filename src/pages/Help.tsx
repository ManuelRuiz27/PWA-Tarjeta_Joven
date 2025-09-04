import Accordion from '@features/help/components/Accordion';
import SupportTicketForm from '@features/help/components/SupportTicketForm';
import { FormattedMessage } from 'react-intl';

export default function Help() {
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
      <h1><FormattedMessage id="help.title" defaultMessage="Centro de ayuda" /></h1>
      <Accordion items={items} />

      <h2><FormattedMessage id="help.ticket.title" defaultMessage="Enviar un ticket" /></h2>
      <SupportTicketForm />
    </section>
  );
}
