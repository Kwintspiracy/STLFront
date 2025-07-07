'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/authService';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { USE_MOCK_DATA } from '@/lib/api/config';
import type { User } from '@/data/mock-users';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();
  const auth = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (USE_MOCK_DATA) {
        // Use existing mock authentication
        const user: User = await login(email, password);
        setUser(user); // ✅ met à jour le contexte global
        router.push(user.studio ? `/studio/${user.studio.id}` : '/');
      } else {
        // Use real API authentication via AuthContext
        await auth.login({ email, password });
        // The AuthContext will handle the success toast and state updates
        // Redirect based on user data (for now, just go to home)
        router.replace('/');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Identifiants invalides';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='w-xl'>
    <form onSubmit={handleSubmit} className="mt-24 p-6 bg-neutral-900 border border-neutral-700 rounded space-y-4">
      <h1 className="text-xl font-bold text-white text-center">Connexion</h1>

      <input
        type="email"
        placeholder="Adresse email"
        className="w-full p-2 bg-neutral-800 border border-neutral-600 rounded text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white p-2 rounded transition-colors"
      >
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>

      <div className="text-center">
        <p className="text-neutral-400 text-sm">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-blue-400 hover:text-blue-300">
            Créer un compte
          </Link>
        </p>
      </div>
    </form>
    </div>
  );
}
