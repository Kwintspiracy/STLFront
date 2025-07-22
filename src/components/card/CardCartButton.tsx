import Link from 'next/link';
import { ReactNode } from 'react';

type CardCartProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

const CardCart = ({ href, children, className = "" }: CardCartProps) => {
  return (
    <Link 
      href={href}
      className={`flex items-center justify-center gap-2 bg-primary text-black rounded hover:bg-[#3f6061] hover:text-secondary transition py-3 px-4 text-base font-medium ${className}`}
      aria-label="Add to cart"
      title="Add to cart"
    >
      {children}
    </Link>
  );
};

export default CardCart;
