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
    <div className="flex items-center justify-center bg-primary text-black rounded hover:bg-blue-800 transition py-1 px-2 text-base">
      {/* {children} */}
      Add to cart
    </div>

    </Link>
  );
};

export default CardCart;
