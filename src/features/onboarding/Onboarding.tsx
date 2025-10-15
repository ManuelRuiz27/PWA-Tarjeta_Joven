import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const STORAGE_KEY = 'tj.hasOnboarded';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getStoredFlag() {
  if (!isBrowser()) return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (error) {
    return true;
  }
}

function persistFlag() {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true');
  } catch (error) {
    // Ignorar errores de almacenamiento (modo incógnito, etc.)
  }
}

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const steps = useMemo(
    () => [
      {
        id: 'intro',
        title: <FormattedMessage id="onboarding.step1.title" defaultMessage="¿Qué es Tarjeta Joven?" />,
        description: (
          <FormattedMessage
            id="onboarding.step1.body"
            defaultMessage="Tu credencial digital para acceder a descuentos, talleres y programas para personas jóvenes en la CDMX."
          />
        ),
      },
      {
        id: 'benefits',
        title: <FormattedMessage id="onboarding.step2.title" defaultMessage="Beneficios" />,
        description: (
          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: 'var(--space-1)' }}>
            <li>
              <FormattedMessage
                id="onboarding.step2.item1"
                defaultMessage="Descuentos en comercios aliados y eventos culturales."
              />
            </li>
            <li>
              <FormattedMessage
                id="onboarding.step2.item2"
                defaultMessage="Wallet digital para guardar tus cupones."
              />
            </li>
            <li>
              <FormattedMessage
                id="onboarding.step2.item3"
                defaultMessage="Notificaciones personalizadas de nuevas oportunidades."
              />
            </li>
          </ul>
        ),
      },
      {
        id: 'install',
        title: <FormattedMessage id="onboarding.step3.title" defaultMessage="Instala la app" />,
        description: (
          <FormattedMessage
            id="onboarding.step3.body"
            defaultMessage='Desde el navegador, toca el botón instalar cuando aparezca el banner o abre el menú y selecciona "Agregar a la pantalla principal".'
          />
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    if (!getStoredFlag()) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      setTimeout(() => dialogRef.current?.focus(), 0);
    }
  }, [visible]);

  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];

  if (!visible) return null;

  function completeOnboarding() {
    persistFlag();
    setVisible(false);
  }

  function nextStep() {
    if (stepIndex + 1 >= totalSteps) {
      completeOnboarding();
    } else {
      setStepIndex((s) => Math.min(totalSteps - 1, s + 1));
    }
  }

  function prevStep() {
    setStepIndex((s) => Math.max(0, s - 1));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        style={{
          width: 'min(520px, 100%)',
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-4)',
          display: 'grid',
          gap: 'var(--space-4)',
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
              <FormattedMessage
                id="onboarding.progress"
                defaultMessage="Paso {step} de {total}"
                values={{ step: stepIndex + 1, total: totalSteps }}
              />
            </p>
            <h2 id="onboarding-title" style={{ margin: 0 }}>
              {currentStep.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={completeOnboarding}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
            }}
          >
            <FormattedMessage id="onboarding.skip" defaultMessage="Omitir" />
          </button>
        </header>

        <div style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height)' }}>{currentStep.description}</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }} aria-hidden="true">
            {steps.map((step, index) => (
              <span
                key={step.id}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: index === stepIndex ? 'var(--color-primary)' : 'var(--color-border)',
                  transition: 'background 200ms ease',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={prevStep}
              disabled={stepIndex === 0}
              className="btn btn-outline-secondary"
            >
              <FormattedMessage id="onboarding.previous" defaultMessage="Atrás" />
            </button>
            <button type="button" onClick={nextStep} className="btn btn-primary">
              {stepIndex + 1 === totalSteps ? (
                <FormattedMessage id="onboarding.finish" defaultMessage="Comenzar" />
              ) : (
                <FormattedMessage id="onboarding.next" defaultMessage="Siguiente" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
