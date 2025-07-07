// lib/api/mock-users.ts
export interface Studio {
  id: number;
  name: string;
  badge: string;
}

export interface User {
  id: number;
  username: string;
  profilePicture: string;
  password: string;
  role: "admin" | "user" | "member";
  studio?: Studio; // facultatif : présent seulement pour les membres de studio
}

export const mockUsers: User[] = [
  {
    id: 1,
    username: "quentin",
    profilePicture: "https://picsum.photos/seed/mf/50",
    password: "azerty",
    role: "admin",
    studio: {
      id: 1,
      name: "Magnetic Foundry",
      badge: "https://picsum.photos/seed/mf/50", // ou ton vrai logo
    },
  },
  {
    id: 2,
    username: "tim",
    profilePicture: "https://picsum.photos/seed/mf/50",
    password: "123456",
    role: "user",
    // pas de studio : simple utilisateur
  },
  {
    id: 3,
    username: "papuche",
    profilePicture: "https://picsum.photos/seed/mf/50",
    password: "123456",
    role: "member",
    studio: {
      id: 1,
      name: "Magnetic Foundry",
      badge: "https://picsum.photos/seed/mf/50", // ou ton vrai logo
  },
},
];
