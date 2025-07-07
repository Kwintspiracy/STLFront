// src/lib/api/userRepository.ts

import { mockUsers, type User } from '@/data/mock-users';

export async function findUserByCredentials(
  username: string,
  password: string
): Promise<User | null> {
  return mockUsers.find(
    (u) => u.username === username && u.password === password
  ) ?? null;
}
