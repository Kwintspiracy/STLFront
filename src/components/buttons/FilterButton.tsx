"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/types/product";

interface Props {
  categories: Category[];
}

export default function FilterCategorie({ categories }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <div className="flex flex-wrap gap-3 px-6 pt-8">
      <FilterLink href={pathname} isActive={!activeCategory}>
        All
      </FilterLink>
      {categories.map((cat) => (
        <FilterLink
          key={cat.id}
          href={`${pathname}?category=${cat.name}`}
          isActive={activeCategory === cat.name}
        >
          {cat.name}
        </FilterLink>
      ))}
    </div>
  );
}

function FilterLink({
  href,
  children,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm rounded-full border transition ${
        isActive
          ? "bg-white text-black font-bold"
          : "border-white text-white hover:bg-white hover:text-black"
      }`}
    >
      {children}
    </Link>
  );
}
