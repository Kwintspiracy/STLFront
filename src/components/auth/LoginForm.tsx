'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/authService';
import { useUser } from '@/context/UserContext';
import type { User } from '@/data/mock-users';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser } = useUser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const user: User = await login(username, password);
      setUser(user); // ✅ met à jour le contexte global
      router.push(user.studio ? `/studio/${user.studio.id}` : '/');
    } catch {
      setError('Identifiants invalides');
    }
  }

  return (
    <div className='w-xl'>
    <form onSubmit={handleSubmit} className="mt-24 p-6 bg-neutral-900 border border-neutral-700 rounded space-y-4">
      <h1 className="text-xl font-bold text-white text-center">Connexion</h1>

      <input
        type="text"
        placeholder="Nom d'utilisateur"
        className="w-full p-2 bg-neutral-800 border border-neutral-600 rounded text-white"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        className="w-full p-2 bg-neutral-800 border border-neutral-600 rounded text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
      >
        Se connecter
      </button>
    </form>
    </div>
  );
}
