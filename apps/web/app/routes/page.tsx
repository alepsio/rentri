'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '../../components/data-table';
import { api } from '../../lib/api';

export default function RoutesPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/routes').then((r) => setRows(r.data)); }, []);
  return <main className="mx-auto max-w-6xl p-6"><h1 className="mb-4 text-2xl font-bold">Rotte</h1><DataTable headers={['Origine', 'Destinazione', 'Prezzo', 'Freq', 'Distanza km']} rows={rows.map((x) => [x.originAirport.iata, x.destinationAirport.iata, Number(x.ticketPrice), x.frequencyPerDay, Math.round(x.distanceKm)])}/></main>;
}
