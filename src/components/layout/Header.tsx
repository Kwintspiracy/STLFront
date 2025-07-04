'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { logout } from '@/lib/utils/sessionService';
import { FaUserCircle, FaShoppingCart } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const Header = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push('/');
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <header className="text-white w-full bg-primarybackground border-b border-[#272D31]">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between py-6 px-4 lg:px-0 relative">
        {/* Logo */}
        <div className="text-xl font-black text-white">
          <Link href="/">
            <span className="text-xl font-black text-white">3D STLForge</span>
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4 relative">
          {/* Cart */}
          <Link
            href="/cart"
            className="flex items-center text-secondary px-4 h-12 gap-2 rounded text-base font-semibold hover:bg-secondarybackground transition"
          >
            <FaShoppingCart />
            <span>Cart</span>
          </Link>

          {/* Separator */}
          <div className="w-px h-6 bg-stone-500" />

          {/* Authenticated or not */}
          {!mounted ? null : user ? (
            <div className="relative">
              <button onClick={toggleDropdown} className="focus:outline-none">
                <img
                  src={user.profilePicture || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-[#8AE232]"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1A1C21] border border-[#2A2D30] rounded shadow-lg z-50">
                  <div className="p-3 text-sm text-white border-b border-[#2A2D30]">
                    Signed in as <br />
                    <span className="font-bold">{user.username}</span>
                  </div>

                  <ul className="flex flex-col">
                    {user.studio ? (
                      <li>
                        <Link
                          href={`/studio/${user.studio.id}`}
                          className="block px-4 py-2 hover:bg-secondarybackground"
                        >
                          My Studio
                        </Link>
                      </li>
                    ) : (
                      <li>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 hover:bg-secondarybackground"
                        >
                          My Account
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-red-700 text-red-400"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="flex items-center text-primary px-4 h-12 gap-2 rounded text-base font-semibold hover:bg-secondarybackground transition"
            >
              <FaUserCircle className="w-5 h-5" />
              Account
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
