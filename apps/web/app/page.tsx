'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Skyward Nexus Tycoon</h1>
        <p className="text-slate-400">MMO gestionale aereo originale: economia globale, rotte dinamiche, finanza e operazioni.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <Link className="card" href="/auth/login">Login</Link>
        <Link className="card" href="/auth/register">Registrati</Link>
        <Link className="card" href="/dashboard">Dashboard</Link>
      </div>
    </main>
  );
}
