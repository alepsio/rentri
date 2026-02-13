'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api.post('/auth/register', { email: form.get('email'), password: form.get('password'), displayName: form.get('displayName') });
    setMsg('Account creato. Verifica email mock attiva.');
    router.push('/onboarding');
  }
  return <form onSubmit={onSubmit} className="mx-auto mt-20 max-w-md card space-y-3"><h1 className="text-xl">Registrazione</h1><input name="displayName" className="w-full rounded bg-slate-800 p-2" /><input name="email" className="w-full rounded bg-slate-800 p-2" /><input type="password" name="password" className="w-full rounded bg-slate-800 p-2" /><button className="rounded bg-indigo-500 px-3 py-2">Crea account</button><p>{msg}</p></form>;
}
