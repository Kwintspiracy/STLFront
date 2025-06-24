import { Category } from "@/types/product";
import { mockCategories } from "@/data/mock-categories"; // create this mock
import { API_BASE_URL, USE_MOCK_DATA } from "@/lib/api/config"; // optional shared config

export async function getAllCategories(): Promise<Category[]> {
  if (USE_MOCK_DATA) {
    return mockCategories;
  }

  const res = await fetch(`${API_BASE_URL}/categories/`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}
