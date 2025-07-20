// src/lib/utils/sessionService.ts

import type { User } from "@/data/mock-users";

export function getSession(): User | null {
  const item = localStorage.getItem("user");
  return item ? JSON.parse(item) : null;
}

export function saveSession(user: User) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem("user");
}
