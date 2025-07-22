import { ReactNode } from 'react';

type CardFavProps = {
  children: ReactNode;
  onClick?: () => void;
  isFavorite?: boolean;
  className?: string;
};

const CardFav = ({ 
  children = '', 
  onClick, 
  isFavorite = false, 
  className = "" 
}: CardFavProps) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center bg-white text-black rounded py-2 px-2 hover:bg-red-500 hover:text-white transition-colors ${className}`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {children}
      <span className="sr-only">
        {isFavorite ? "Remove from favorites" : "Add to favorites"}
      </span>
    </button>
  );
};

export default CardFav;
