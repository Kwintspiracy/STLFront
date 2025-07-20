'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaFire, FaCrown } from 'react-icons/fa';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { href: '/', label: 'Home', icon: FaHome },
  { href: '/trending', label: 'Trending', icon: FaFire },
  { href: '/featured', label: 'Featured', icon: FaCrown },
];

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = "" }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={`hidden lg:flex items-center gap-1 ${className}`}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isActive 
                ? 'bg-primary/10 text-primary' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
