'use client';
import { useEffect, useState } from 'react';
import { KpiCards } from '../../components/kpi-cards';
import { api } from '../../lib/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>();
  const [airline, setAirline] = useState<any>();

  useEffect(() => {
    api.get('/finance/summary').then((r) => setSummary(r.data));
    api.get('/airline/me').then((r) => setAirline(r.data));
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard Operativa</h1>
      <KpiCards items={[
        { label: 'Cash', value: summary?.cash ?? '-' },
        { label: 'Debito', value: summary?.debt ?? '-' },
        { label: 'Reputazione', value: airline?.reputation ?? '-' },
        { label: 'Puntualità', value: airline?.punctuality ?? '-' },
      ]} />
    </main>
  );
}
