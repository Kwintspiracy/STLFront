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
  // Additional fields to match API structure
  email?: string;
  firstName?: string;
  lastName?: string;
}

export const mockUsers: User[] = [
  {
    id: 1,
    username: "quentin",
    profilePicture: "https://picsum.photos/seed/mf/50",
    password: "azerty",
    role: "admin",
    email: "quentin@magneticfoundry.com",
    firstName: "Quentin",
    lastName: "Admin",
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
    email: "tim@example.com",
    firstName: "Tim",
    lastName: "User",
    // pas de studio : simple utilisateur
  },
  {
    id: 3,
    username: "papuche",
    profilePicture: "https://picsum.photos/seed/mf/50",
    password: "123456",
    role: "member",
    email: "papuche@magneticfoundry.com",
    firstName: "Papuche",
    lastName: "Member",
    studio: {
      id: 1,
      name: "Magnetic Foundry",
      badge: "https://picsum.photos/seed/mf/50", // ou ton vrai logo
    },
  },
];
