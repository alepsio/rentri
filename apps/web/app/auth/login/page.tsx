'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth';

export default function LoginPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const { data } = await api.post('/auth/login', { email: form.get('email'), password: form.get('password') });
      setAccessToken(data.accessToken);
      router.push('/dashboard');
    } catch {
      setError('Credenziali non valide');
    }
  }

  return <form onSubmit={onSubmit} className="mx-auto mt-20 max-w-md card space-y-3"><h1 className="text-xl">Login</h1><input name="email" className="w-full rounded bg-slate-800 p-2" /><input type="password" name="password" className="w-full rounded bg-slate-800 p-2" /><button className="rounded bg-indigo-500 px-3 py-2">Entra</button><p>{error}</p></form>;
}
