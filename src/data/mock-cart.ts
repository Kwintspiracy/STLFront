// src/mock/mock-cart.ts

export interface CartProduct {
  id: number;
  name: string;
  price: string;
  quantity?: number;
  creator: {
    name: string;
  };
  image: string;
}

export const mockCart: CartProduct[] = [
  {
    id: 1,
    name: "Elven Ranger Hero",
    price: "8.99",
    quantity: 1,
    creator: { name: "Forge of Elves" },
    image: "https://picsum.photos/seed/product1-1/600",
  },
  {
    id: 2,
    name: "Dwarf Warrior Bust",
    price: "6.49",
    quantity: 2,
    creator: { name: "Stonecutters Guild" },
    image: "https://picsum.photos/seed/product1-1/600",
  },
  {
    id: 3,
    name: "Sorceress with Fireball",
    price: "7.99",
    quantity: 1,
    creator: { name: "Mystic Miniatures" },
    image: "https://picsum.photos/seed/product1-1/600",
  },
];
