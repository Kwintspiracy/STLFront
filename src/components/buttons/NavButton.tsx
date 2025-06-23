import Link from 'next/link';
import { ReactNode } from 'react';

type NavButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

const NavButton = ({ href, children, className = '' }: NavButtonProps) => {
  return (
    <Link href={href}>
      <span
        className={` ${className}`}
      >
        {children}
      </span>
    </Link>
  );
};

export default NavButton;
