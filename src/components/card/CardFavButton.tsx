import { ReactNode } from 'react';

type CardFavProps = {
  children: ReactNode;
};

const CardFav = ({ children = '' }: CardFavProps) => {
  return (
    <div className="flex items-center justify-center bg-white text-black rounded py-2 px-2 gap-">
     {children}
    </div>
  );
};

export default CardFav;
