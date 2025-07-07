import Link from 'next/link';
import { ReactNode } from 'react';
import { TbShoppingCartPlus } from "react-icons/tb";

type CardCartProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

const CardCart = ({ href }: CardCartProps) => {
  return (
    <Link href={href}>
      <div className="flex items-center justify-center bg-primary text-black rounded hover:bg-[#3f6061] hover:text-secondary transition py-1 px-2 text-base">
        {/* {children} */}
        <TbShoppingCartPlus className="w-6 h-6" />
      </div>

    </Link>
  );
};

export default CardCart;
