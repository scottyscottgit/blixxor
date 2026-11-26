import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ features: [] });
  }

  try {
    // Limite à 15 résultats pour ne pas évincer les grandes villes mondiales (Miami, Montréal, etc.)
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=15&lang=fr&lat=46.6033&lon=1.8883`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Geo:", error);
    return NextResponse.json({ error: "Erreur serveur Geo" }, { status: 500 });
  }
}