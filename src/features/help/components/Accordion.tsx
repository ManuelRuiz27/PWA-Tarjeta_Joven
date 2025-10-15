import { useId, useState } from 'react';

export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * Acordeón accesible: cada item es un botón con `aria-expanded` que controla
 * una región con `role="region"` y `aria-labelledby`.
 */
export function AccordionItem({ title, children, defaultOpen }: AccordionItemProps) {
  const [open, setOpen] = useState(!!defaultOpen);
  const btnId = useId();
  const panelId = `${btnId}-panel`;
  return (
    <div className="accordion-item border rounded mb-2">
      <h3 className="m-0">
        <button
          id={btnId}
          className="w-100 text-start btn btn-link p-3"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {title}
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        hidden={!open}
        className="px-3 pb-3"
      >
        {children}
      </div>
    </div>
  );
}

export interface AccordionProps {
  items: Array<{ title: string; content: React.ReactNode; defaultOpen?: boolean }>;
}

export default function Accordion({ items }: AccordionProps) {
  return (
    <div aria-label="Preguntas frecuentes">
      {items.map((it, i) => (
        <AccordionItem
          key={i}
          title={it.title}
          {...(it.defaultOpen !== undefined ? { defaultOpen: it.defaultOpen } : {})}
        >
          {it.content}
        </AccordionItem>
      ))}
    </div>
  );
}

