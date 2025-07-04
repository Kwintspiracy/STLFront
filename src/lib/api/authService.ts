// services/authService.ts
import { findUserByCredentials } from "@/lib/api/userRepository";
import { saveSession } from "@/lib/utils/sessionService";

export async function login(username: string, password: string) {
  const user = await findUserByCredentials(username, password);
  if (!user) throw new Error("Invalid username or password");
  saveSession(user); // tu peux aussi choisir les infos à stocker
  return user;
}

export function logout() {
  localStorage.removeItem("user");
}
