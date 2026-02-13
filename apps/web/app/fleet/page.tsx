'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '../../components/data-table';
import { api } from '../../lib/api';

export default function FleetPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/aircraft').then((r) => setRows(r.data)); }, []);
  return <main className="mx-auto max-w-6xl p-6"><h1 className="mb-4 text-2xl font-bold">Flotta</h1><DataTable headers={['Reg', 'Modello', 'Stato', 'Salute']} rows={rows.map((x) => [x.registrationCode, x.model.name, x.state, x.health.toFixed(1)])}/></main>;
}
