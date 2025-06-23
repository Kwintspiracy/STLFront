import Link from 'next/link';
import { ReactNode } from 'react';

type CardCartProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

const CardCart = ({ href, children, className = '' }: CardCartProps) => {
  return (
    <Link href={href}>
    <div className="flex items-center justify-center bg-primary text-black rounded hover:bg-blue-800 transition py-2 px-2 gap-">
      {children}
    </div>

    </Link>
  );
};

export default CardCart;
