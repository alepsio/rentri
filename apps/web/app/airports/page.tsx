'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '../../components/data-table';
import { api } from '../../lib/api';

export default function AirportsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/airports').then((r) => setRows(r.data)); }, []);
  return <main className="mx-auto max-w-6xl p-6"><h1 className="mb-4 text-2xl font-bold">Aeroporti</h1><DataTable headers={['IATA', 'Città', 'Paese', 'Slot', 'Fuel Base']} rows={rows.map((x) => [x.iata, x.city, x.country, x.slotCapacity, Number(x.fuelPriceBase)])}/></main>;
}
