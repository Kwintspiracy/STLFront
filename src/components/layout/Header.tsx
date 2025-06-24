import NavButton from '@/components/buttons/NavButton';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="text-white w-full bg-[#0F1213]  border-b-[#272D31] border-b-1">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between py-4 px-4 lg:px-0 text-black border">


        {/* Logo */}
        <div className="text-xl font-black text-white"><a href="http://localhost:3000/">3D STLForge</a></div>

        {/* Main Navigation */}
        {/* <nav className="hidden md:flex items-center space-x-6">
          <NavButton href="/fantasy">Fantasy</NavButton>
          <NavButton href="/science-fiction">Sci-Fi</NavButton>
          <NavButton href="/terrain">Terrain</NavButton>
        </nav> */}

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <span className="cursor-pointer">Cart</span>
          <span className="cursor-pointer btn"><a href="auth/signin">Sign In</a></span>
        </div>
      </div>
    </header>
  );
};

export default Header;
