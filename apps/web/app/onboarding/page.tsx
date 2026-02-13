'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function OnboardingPage() {
  const [airports, setAirports] = useState<any[]>([]);
  useEffect(() => { api.get('/airports').then((r) => setAirports(r.data)); }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api.post('/airline', { name: form.get('name'), code: form.get('code'), timezone: 'Europe/Rome', language: 'it', homeAirportId: form.get('homeAirportId') });
    alert('Compagnia creata');
  }
  return <form onSubmit={submit} className="mx-auto mt-10 max-w-xl card space-y-3"><h1>Onboarding compagnia</h1><input name="name" className="w-full rounded bg-slate-800 p-2" placeholder="Nome compagnia"/><input name="code" className="w-full rounded bg-slate-800 p-2" placeholder="Codice"/><select name="homeAirportId" className="w-full rounded bg-slate-800 p-2">{airports.map((a) => <option key={a.id} value={a.id}>{a.iata} - {a.city}</option>)}</select><button className="rounded bg-indigo-500 px-3 py-2">Conferma</button></form>;
}
