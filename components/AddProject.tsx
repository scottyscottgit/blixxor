"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AddProject() {
  const [name, setName] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleAddressSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const res = await fetch(`/api/geo?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        console.log("Données reçues de l'API :", data); // <--- DEBUG : À voir dans la console (F12)
        setSuggestions(data.features || []);
      } catch (err) {
        console.error("Erreur auto-complete :", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (feature: any) => {
    const p = feature.properties;
    console.log("Propriétés sélectionnées :", p);

    // 1. Détection de la Ville
    const detectedCity = p.city || p.town || p.village || p.municipality || p.county || "";

    // 2. Détection de la Rue :
    // Si p.street existe, on le prend. 
    // Sinon, si p.name existe et n'est pas le nom de la ville, c'est forcément la rue !
    const detectedStreet = p.street || (p.name && p.name !== detectedCity ? p.name : "");

    // 3. Mise à jour de tous les champs
    setStreetNumber(p.housenumber || "");
    setStreet(detectedStreet);
    setPostcode(p.postcode || "");
    setCity(detectedCity || p.name || "");
    setCountry(p.country || "");
    
    // Fermer les suggestions
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullAddress = [
      `${streetNumber} ${street}`.trim(),
      postcode,
      city,
      country
    ].filter(Boolean).join(", ");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Session expirée");

      const { error } = await supabase.from("projects").insert([
        { name, address: fullAddress, user_id: user.id }
      ]);

      if (error) throw error;

      alert("🚀 Chantier créé !");
      setName(""); setStreetNumber(""); setStreet(""); setPostcode(""); setCity(""); setCountry("");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl max-w-lg mx-auto text-white">
      <h2 className="text-xl font-bold mb-6 italic text-yellow-500">BLIXXOR - NOUVEAU PROJET</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-bold">NOM DU CHANTIER</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
            placeholder="Ex: Rénovation Loft"
            required
          />
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="relative">
          <label className="block text-xs text-yellow-500 mb-1 font-bold">🔍 RECHERCHE D'ADRESSE (AIDE)</label>
          <input
            value={searchQuery}
            onChange={handleAddressSearch}
            className="w-full p-3 bg-gray-900 border-2 border-yellow-500/50 rounded-lg focus:border-yellow-500 outline-none text-sm"
            placeholder="Tapez ici pour rechercher..."
            autoComplete="off"
          />
          
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 z-[9999] bg-white text-black mt-1 rounded-lg shadow-2xl max-h-60 overflow-y-auto border-2 border-yellow-500">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => selectSuggestion(s)}
                  className="p-3 hover:bg-yellow-100 cursor-pointer border-b border-gray-200 last:border-0 text-sm font-medium"
                >
                  {[s.properties.housenumber, s.properties.street || s.properties.name, s.properties.postcode, s.properties.city, s.properties.country].filter(Boolean).join(", ")}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CHAMPS MANUELS */}
        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-1">
            <label className="block text-[10px] text-gray-500">N°</label>
            <input value={streetNumber} onChange={(e)=>setStreetNumber(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"/>
          </div>
          <div className="col-span-5">
            <label className="block text-[10px] text-gray-500">RUE</label>
            <input value={street} onChange={(e)=>setStreet(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm" required/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-gray-500">CP</label>
            <input value={postcode} onChange={(e)=>setPostcode(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm" required/>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500">VILLE</label>
            <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm" required/>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-gray-500">PAYS</label>
          <input value={country} onChange={(e)=>setCountry(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm" required/>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-lg transition-all transform active:scale-95"
        >
          {loading ? "CHARGEMENT..." : "VALIDER LE CHANTIER"}
        </button>
      </form>
    </div>
  );
}