'use client';

import Link from 'next/link';

interface ActionButton {
  text: string;
  href: string;
  primary?: boolean;
}

interface CallToActionProps {
  title?: string;
  description?: string;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  className?: string;
}

export default function CallToAction({
  title = "Ready to Start Creating?",
  description = "Join thousands of creators and tabletop enthusiasts. Upload your models or discover your next favorite miniature.",
  primaryAction = { text: "Start Selling", href: "/upload", primary: true },
  secondaryAction = { text: "Browse Models", href: "/browse" },
  className = ""
}: CallToActionProps) {
  return (
    <div className={`bg-gradient-to-r from-primary/10 to-primary/5 ${className}`} style={{ borderTopWidth: 'var(--border-width)', borderBottomWidth: 'var(--border-width)', borderColor: 'rgba(73, 197, 201, 0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryAction && (
            <Link 
              href={primaryAction.href}
              className="px-8 py-3 bg-primary text-black rounded-lg font-semibold hover:bg-[#3f6061] hover:text-secondary transition-colors"
            >
              {primaryAction.text}
            </Link>
          )}
          {secondaryAction && (
            <Link 
              href={secondaryAction.href}
              className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors"
            >
              {secondaryAction.text}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
