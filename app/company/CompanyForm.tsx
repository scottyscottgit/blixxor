"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Save, ShieldCheck, Palette, Upload, Loader2, CheckCircle2, Info } from "lucide-react";
import { saveCompanySettings } from "./actions";

const COLORS = [
  { name: "Bleu Pro", hex: "#2563eb" },
  { name: "Orange BTP", hex: "#ea580c" },
  { name: "Vert Forêt", hex: "#16a34a" },
  { name: "Jaune Chantier", hex: "#ca8a04" },
  { name: "Ardoise", hex: "#334155" },
  { name: "Rouge Brique", hex: "#dc2626" },
];

const IDENTITY_FIELDS = [
  { key: "company_name", label: "Raison sociale *", placeholder: "Ex : Dupont Rénovation SAS", full: true },
  { key: "contact_name", label: "Gérant / interlocuteur", placeholder: "Jean Dupont" },
  { key: "phone", label: "Téléphone", placeholder: "06 12 34 56 78" },
  { key: "email", label: "Email professionnel", placeholder: "contact@dupont.fr", full: true },
  { key: "address", label: "Adresse", placeholder: "14 rue des Artisans", full: true },
  { key: "postal_code", label: "Code postal", placeholder: "75011" },
  { key: "city", label: "Ville", placeholder: "Paris" },
];

const LEGAL_FIELDS = [
  { key: "siret", label: "SIRET", placeholder: "123 456 789 00012" },
  { key: "vat_number", label: "N° TVA intracommunautaire", placeholder: "FR12345678901" },
  { key: "insurance_name", label: "Assureur décennale / RCP", placeholder: "SMABTP, AXA, MAAF…" },
  { key: "insurance_policy", label: "N° de contrat", placeholder: "POL-987654321" },
  { key: "insurance_coverage", label: "Zone de couverture", placeholder: "France métropolitaine", full: true },
];

const inputClass =
  "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function CompanyForm({ initial }: { initial: Record<string, any> }) {
  const [values, setValues] = useState<Record<string, string>>({
    company_name: initial.company_name ?? "",
    contact_name: initial.contact_name ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    address: initial.address ?? "",
    postal_code: initial.postal_code ?? "",
    city: initial.city ?? "",
    siret: initial.siret ?? "",
    vat_number: initial.vat_number ?? "",
    insurance_name: initial.insurance_name ?? "",
    insurance_policy: initial.insurance_policy ?? "",
    insurance_coverage: initial.insurance_coverage ?? "France métropolitaine",
    footer_notes: initial.footer_notes ?? "",
  });
  const [color, setColor] = useState<string>(initial.primary_color || "#2563eb");
  const [badge, setBadge] = useState<boolean>(initial.show_blixxor_badge ?? true);
  const [logoUrl, setLogoUrl] = useState<string>(initial.logo_url || "");
  const [logoPreview, setLogoPreview] = useState<string>(initial.logo_url || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 900 * 1024) {
      setError("Logo trop lourd (max 900 Ko). Réduis l'image puis réessaie.");
      return;
    }
    setError(null);
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setError(null);
    setOk(false);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => fd.append(k, v));
      fd.append("primary_color", color);
      fd.append("show_blixxor_badge", badge ? "true" : "false");
      fd.append("existing_logo_url", logoUrl);
      if (logoFile) fd.append("logo_file", logoFile);

      const res = await saveCompanySettings(fd);
      if (res.success) {
        setOk(true);
        if (res.logo_url) setLogoUrl(res.logo_url);
        setLogoFile(null);
        setTimeout(() => setOk(false), 4000);
      } else {
        setError(res.error || "Erreur à l'enregistrement");
      }
    } catch (err: any) {
      setError(err?.message || "Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const renderFields = (fields: typeof IDENTITY_FIELDS) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fields.map((f) => (
        <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{f.label}</label>
          <input
            type="text"
            value={values[f.key]}
            onChange={(e) => setField(f.key, e.target.value)}
            placeholder={f.placeholder}
            className={inputClass}
          />
        </div>
      ))}
    </div>
  );

  return (
    <form onSubmit={submit} className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Mon Entreprise
            </h1>
            <p className="text-xs text-slate-500">Identité, mentions & documents</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Envoi…" : ok ? "Enregistré !" : "Sauvegarder"}</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-5 space-y-5">
        {ok && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" /> Informations enregistrées. Tes prochains documents les utiliseront.
          </div>
        )}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
            <Info className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Palette className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold">Logo & couleur</h2>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-xl border-2 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden"
              style={{ borderColor: color }}
            >
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer border border-slate-300">
                <Upload className="w-3.5 h-3.5" />
                <span>{logoPreview ? "Changer le logo" : "Ajouter un logo"}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onLogo} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-400 mt-1.5">PNG ou JPG, max 900 Ko</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Couleur des documents</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium ${
                    color.toLowerCase() === c.hex ? "border-slate-900 ring-2 ring-slate-900/10 font-bold" : "border-slate-200"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                  {c.name}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              Personnalisée :
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-7 h-7 rounded border border-slate-300 p-0" />
              <span className="font-mono">{color}</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold">Coordonnées</h2>
          </div>
          {renderFields(IDENTITY_FIELDS)}
        </section>

        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold">Mentions légales & assurance décennale</h2>
          </div>
          {renderFields(LEGAL_FIELDS)}
        </section>

        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold">Pied de page</h2>
          <textarea
            rows={2}
            value={values.footer_notes}
            onChange={(e) => setField("footer_notes", e.target.value)}
            placeholder="Ex : SAS au capital de 10 000 € – RCS Paris 123 456 789"
            className={inputClass}
          />
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs">
            <input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} className="w-4 h-4" />
            <span className="font-semibold text-slate-800">Afficher « Created by Blixxor » sur les documents</span>
          </label>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Enregistrement…" : "Enregistrer les informations"}
        </button>
      </main>
    </form>
  );
}