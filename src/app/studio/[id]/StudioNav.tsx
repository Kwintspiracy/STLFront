'use client';

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Studio } from "@/types/product";

interface Props {
  children: ReactNode;
  studio: Studio;
}

export default function StudioClientLayout({ children, studio }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F1213] text-white flex flex-col lg:flex-row relative">
      {/* Mobile header */}
      <header className="flex items-center justify-between p-4 border-b border-[#2A2D30] lg:hidden">
        <div className="flex items-center gap-3">
          {studio.badge && (
            <img
              src={studio.badge}
              alt={studio.name}
              className="w-10 h-10 rounded-full border border-[var(--color-primary-studio)]"
            />
          )}
          <h2 className="text-lg font-bold">{studio.name}</h2>
        </div>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="text-white text-xl"
        >
          ☰
        </button>
      </header>

      {/* Slide-in mobile menu */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#1A1C21] border-r border-[#2A2D30] p-6 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {studio.badge && (
              <img
                src={studio.badge}
                alt={studio.name}
                className="w-6 h-6 rounded-full object-cover border border-[var(--color-primary-studio)]"
              />
            )}
            <h2 className="text-xl font-bold">{studio.name}</h2>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="text-white text-xl">✕</button>
        </div>
        <nav className="flex flex-col gap-4 text-sm">
          <Link href={`/studio/${studio.id}`} onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--color-primary-studio)] transition-colors">Dashboard</Link>
          <Link href={`/studio/${studio.id}/products`} onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--color-primary-studio)] transition-colors">My Products</Link>
          <Link href={`/studio/${studio.id}/settings`} onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--color-primary-studio)] transition-colors">Settings</Link>
        </nav>
      </div>

      {/* Sidebar (desktop only) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1A1C21] border-r border-[#2A2D30] p-6 gap-6">
        <div className="flex items-center gap-3">
          {studio.badge && (
            <img
              src={studio.badge}
              alt={studio.name}
              className="w-10 h-10 rounded-full border border-[var(--color-primary-studio)]"
            />
          )}
          <h2 className="text-xl font-bold">{studio.name}</h2>
        </div>
        <nav className="flex flex-col gap-3 pt-4 text-sm">
          <Link href={`/studio/${studio.id}`} className="hover:text-[var(--color-primary-studio)] transition-colors">Dashboard</Link>
          <Link href={`/studio/${studio.id}/products`} className="hover:text-[var(--color-primary-studio)] transition-colors">My Products</Link>
          <Link href={`/studio/${studio.id}/settings`} className="hover:text-[var(--color-primary-studio)] transition-colors">Settings</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
