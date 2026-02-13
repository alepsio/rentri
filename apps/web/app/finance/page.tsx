'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '../../components/data-table';
import { api } from '../../lib/api';

export default function FinancePage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/finance/ledger').then((r) => setRows(r.data)); }, []);
  return <main className="mx-auto max-w-6xl p-6"><h1 className="mb-4 text-2xl font-bold">Finanza</h1><DataTable headers={['Data', 'Tipo', 'Importo', 'Descrizione']} rows={rows.map((x) => [new Date(x.createdAt).toLocaleString(), x.type, Number(x.amount), x.description])}/></main>;
}
