"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Building, Search, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("France");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleAddressSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 2) {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geo?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.features || []);
      } catch (err) {
        console.error("Erreur auto-complete :", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (feature: any) => {
    const p = feature.properties;
    const detectedCity = p.city || p.town || p.village || p.municipality || p.county || "";
    const detectedStreet = p.street || (p.name && p.name !== detectedCity ? p.name : "");

    setStreetNumber(p.housenumber || "");
    setStreet(detectedStreet);
    setPostcode(p.postcode || "");
    setCity(detectedCity || p.name || "");
    setCountry(p.country || "France");

    setSearchQuery("");
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Veuillez saisir un nom pour le chantier.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const fullAddress = [
      `${streetNumber} ${street}`.trim(),
      postcode,
      city,
      country
    ].filter(Boolean).join(", ");

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name: name.trim(),
            address: fullAddress || "Adresse non renseignée"
          }
        ])
        .select()
        .single();

      if (error) throw error;

      router.push(`/projects/${data.id}`);
      router.refresh();
    } catch (err: any) {
      console.error("Erreur création chantier:", err);
      setErrorMsg(err.message || "Erreur lors de la création du chantier");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 flex flex-col items-center pb-20">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux chantiers
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Nouveau chantier</h1>
              <p className="text-xs text-slate-500">Renseignez le nom et la localisation</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom du chantier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nom du chantier *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="ex: Rénovation Appartement Haussmann"
                className="w-full p-3.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm"
              />
            </div>

            {/* Barre de recherche d'adresse avec autocomplétion */}
            <div className="relative">
              <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Recherche d'adresse (Aide internationale)
              </label>
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={handleAddressSearch}
                  type="text"
                  placeholder="Tapez une rue, une ville..."
                  autoComplete="off"
                  className="w-full p-3.5 pl-10 rounded-xl bg-blue-50/50 text-slate-900 border border-blue-200 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                />
                <MapPin className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 z-50 bg-white text-slate-900 mt-1.5 rounded-2xl shadow-xl max-h-60 overflow-y-auto border border-slate-200 divide-y divide-slate-100">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => selectSuggestion(s)}
                      className="p-3 hover:bg-blue-50 cursor-pointer text-xs font-medium text-slate-700 flex items-start gap-2 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>
                        {[
                          s.properties.housenumber,
                          s.properties.street || s.properties.name,
                          s.properties.postcode,
                          s.properties.city,
                          s.properties.country
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Champs manuels détaillés & universels */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-4 gap-2.5">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    N°
                  </label>
                  <input
                    value={streetNumber}
                    onChange={(e) => setStreetNumber(e.target.value)}
                    type="text"
                    placeholder="12 bis"
                    className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Rue / Voie
                  </label>
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    type="text"
                    placeholder="Rue de la République"
                    className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Code Postal
                  </label>
                  <input
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    type="text"
                    placeholder="75001"
                    className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Ville
                  </label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    type="text"
                    placeholder="Paris"
                    className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Pays
                </label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  type="text"
                  placeholder="France, Belgique, Suisse..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création en cours...</span>
                </>
              ) : (
                <span>Créer le chantier</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}