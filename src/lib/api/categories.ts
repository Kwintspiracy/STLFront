// src/lib/api/categories.ts

import { Category } from "@/types/product";

export async function getAllCategories(): Promise<Category[]> {
  const res = await fetch("http://127.0.0.1:8000/api/", { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const products = await res.json();

  const categoryMap = new Map<number, Category>();

  for (const product of products) {
    for (const cat of product.category) {
      categoryMap.set(cat.id, cat); // dédupliqué par ID
    }
  }

  return Array.from(categoryMap.values());
}
