import { useEffect, useRef, useState } from 'react';
import FileUploader from '@app/components/FileUploader';
import { useToast } from '@app/components/ToastProvider';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface ConsentData {
  marketing: boolean;
  dataProcessing: boolean;
  notificationsEnabled: boolean;
}

interface DocumentItem {
  fileId: string;
  name: string;
  url?: string;
}

export default function Profile() {
  // Datos básicos
  const [profile, setProfile] = useState<ProfileData>({ name: '', email: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  // Consentimientos
  const [consents, setConsents] = useState<ConsentData>({ marketing: false, dataProcessing: false, notificationsEnabled: false });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Documentos
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const errorsRef = useRef<HTMLDivElement | null>(null);
  const { show } = useToast();

  useEffect(() => {
    // Carga inicial (mock): lee de localStorage para notificaciones
    const notif = localStorage.getItem('pref.notificationsEnabled');
    if (notif != null) setConsents((c) => ({ ...c, notificationsEnabled: notif === 'true' }));
  }, []);

  function validateProfile() {
    const e: Record<string, string> = {};
    if (!profile.name.trim()) e['name'] = 'El nombre es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e['email'] = 'Email inválido.';
    if (!/^\+?\d{10,15}$/.test(profile.phone)) e['phone'] = 'Teléfono inválido.';
    setProfileError(Object.values(e)[0] || null);
    if (Object.keys(e).length) {
      setTimeout(() => errorsRef.current?.focus(), 0);
    }
    return Object.keys(e).length === 0;
  }

  async function saveProfile() {
    if (!validateProfile()) return;
    try {
      setSavingProfile(true);
      setProfileSaved(false);
      setProfileError(null);
      const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
      if (!res.ok) throw new Error(await res.text().catch(() => 'Error al guardar perfil'));
      setProfileSaved(true);
      show('Datos de perfil guardados', { variant: 'success' });
    } catch (e: any) {
      setProfileError(e?.message || 'Error al guardar perfil');
      show('Error al guardar perfil', { variant: 'error' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePreferences(next?: Partial<ConsentData>) {
    const prefs = { ...consents, ...next };
    setConsents(prefs);
    try {
      setSavingPrefs(true);
      setPrefsSaved(false);
      // Persistencia local para notificaciones
      localStorage.setItem('pref.notificationsEnabled', String(prefs.notificationsEnabled));
      const res = await fetch('/api/profile/preferences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) });
      if (!res.ok) throw new Error(await res.text().catch(() => 'Error al guardar preferencias'));
      setPrefsSaved(true);
    } catch (e) {
      // Mantén el estado pero no ocultes el error; podríamos mostrar un toast
    } finally {
      setSavingPrefs(false);
    }
  }

  function onFileUploaded({ fileId, file, url }: { fileId: string; file: File; url?: string }) {
    const doc: DocumentItem = url ? { fileId, name: file.name, url } : { fileId, name: file.name };
    setDocuments((prev) => [...prev, doc]);
    show('Documento registrado', { variant: 'success' });
    // Notifica al backend que el documento fue subido y asociado al perfil
    fetch('/api/profile/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    }).catch(() => {
      // Silencia errores de red para no interrumpir la UI; se podría mostrar un toast
    });
  }

  return (
    <section>
      <h1>Perfil</h1>

      {/* Datos básicos */}
      <h2 className="h5 mt-3">Datos básicos</h2>
      {profileError && (
        <div ref={errorsRef} role="alert" tabIndex={-1} className="text-danger">{profileError}</div>
      )}
      {profileSaved && <div role="status" aria-live="polite" className="text-success">Datos guardados.</div>}
      <div className="row g-2" aria-label="Formulario de perfil">
        <div className="col-sm-4">
          <label htmlFor="name" className="form-label">Nombre</label>
          <input id="name" className="form-control" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.currentTarget.value }))} />
        </div>
        <div className="col-sm-4">
          <label htmlFor="email" className="form-label">Email</label>
          <input id="email" type="email" className="form-control" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.currentTarget.value }))} />
        </div>
        <div className="col-sm-4">
          <label htmlFor="phone" className="form-label">Teléfono</label>
          <input id="phone" className="form-control" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.currentTarget.value }))} />
        </div>
      </div>
      <div className="mt-2">
        <button className="btn btn-primary" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Guardando…' : 'Guardar'}</button>
      </div>

      {/* Consentimientos */}
      <h2 className="h5 mt-4">Preferencias</h2>
      {prefsSaved && <div role="status" aria-live="polite" className="text-success">Preferencias guardadas.</div>}
      <div className="d-grid gap-2" role="group" aria-label="Consentimientos">
        <label className="form-check-label d-flex align-items-center gap-2">
          <input type="checkbox" className="form-check-input" checked={consents.marketing} onChange={(e) => savePreferences({ marketing: e.currentTarget.checked })} />
          Recibir correos promocionales
        </label>
        <label className="form-check-label d-flex align-items-center gap-2">
          <input type="checkbox" className="form-check-input" checked={consents.dataProcessing} onChange={(e) => savePreferences({ dataProcessing: e.currentTarget.checked })} />
          Acepto el tratamiento de mis datos
        </label>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={consents.notificationsEnabled}
            className="btn btn-outline-secondary"
            onClick={() => savePreferences({ notificationsEnabled: !consents.notificationsEnabled })}
            disabled={savingPrefs}
          >
            Notificaciones: {consents.notificationsEnabled ? 'Activadas' : 'Desactivadas'}
          </button>
          <small className="text-muted">Se guarda automáticamente.</small>
        </div>
      </div>

      {/* Documentos */}
      <h2 className="h5 mt-4">Documentos</h2>
      <FileUploader label="Subir documento (PDF/JPG)" onUploaded={onFileUploaded} />
      {documents.length > 0 && (
        <ul className="list-unstyled mt-2" aria-label="Documentos subidos">
          {documents.map((d) => (
            <li key={d.fileId} className="d-flex align-items-center gap-2">
              <span className="badge text-bg-light">{d.fileId}</span>
              <span>{d.name}</span>
              {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="ms-auto">Ver</a>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
