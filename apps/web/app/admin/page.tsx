'use client';
import { FormEvent } from 'react';
import { api } from '../../lib/api';

export default function AdminPage() {
  async function patchEconomy(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await api.patch('/admin/economy', { key: f.get('key'), value: { value: Number(f.get('value')) } });
    alert('Parametro aggiornato');
  }
  return <main className="mx-auto max-w-4xl p-6"><h1 className="mb-4 text-2xl font-bold">Admin Panel</h1><form onSubmit={patchEconomy} className="card"><input name="key" className="mb-2 w-full rounded bg-slate-800 p-2" placeholder="priceSensitivity"/><input name="value" type="number" step="0.01" className="mb-2 w-full rounded bg-slate-800 p-2"/><button className="rounded bg-red-500 px-3 py-2">Aggiorna economia</button></form></main>;
}
