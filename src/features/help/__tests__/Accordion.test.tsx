import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Accordion, { AccordionItem } from '../components/Accordion';

describe('Accordion', () => {
  it('renderiza items y permite toggle', () => {
    render(
      <Accordion
        items={[
          { title: 'Pregunta 1', content: <p>Respuesta 1</p>, defaultOpen: true },
          { title: 'Pregunta 2', content: <p>Respuesta 2</p> },
        ]}
      />
    );
    // Primer panel visible
    expect(screen.getByText('Respuesta 1')).toBeInTheDocument();
    // Segundo oculto hasta click
    expect(screen.queryByText('Respuesta 2')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pregunta 2' }));
    expect(screen.getByText('Respuesta 2')).toBeInTheDocument();
  });

  it('item individual funciona en aislamiento', () => {
    render(
      <AccordionItem title="P" defaultOpen>
        <p>R</p>
      </AccordionItem>
    );
    expect(screen.getByText('R')).toBeInTheDocument();
  });
});

