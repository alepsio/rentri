'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '../../components/data-table';
import { api } from '../../lib/api';

export default function LeaderboardPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/leaderboard').then((r) => setRows(r.data)); }, []);
  return <main className="mx-auto max-w-6xl p-6"><h1 className="mb-4 text-2xl font-bold">Leaderboard</h1><DataTable headers={['Compagnia', 'Valore', 'Puntualità', 'Reputazione']} rows={rows.map((x) => [x.name, Math.round(x.companyValue), x.punctuality.toFixed(1), x.reputation.toFixed(1)])}/></main>;
}
