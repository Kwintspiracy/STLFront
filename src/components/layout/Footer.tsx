import Link from 'next/link';
import { FaDiscord, FaTwitter, FaInstagram, FaYoutube, FaEnvelope } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-primarybackground border-t border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">3D</span>
              </div>
              <span className="text-xl font-bold text-white">STLForge</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The ultimate marketplace for premium 3D printable models. Join thousands of creators and makers worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaDiscord className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Browse</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  All STL Files
                </Link>
              </li>
              <li>
                <Link href="/featured" className="text-gray-400 hover:text-white transition-colors">
                  Featured Models
                </Link>
              </li>
              <li>
                <Link href="/trending" className="text-gray-400 hover:text-white transition-colors">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/commercial" className="text-gray-400 hover:text-white transition-colors">
                  Commercial License
                </Link>
              </li>
              <li>
                <Link href="/free" className="text-gray-400 hover:text-white transition-colors">
                  Free STLs
                </Link>
              </li>
            </ul>
          </div>

          {/* Creators */}
          <div>
            <h4 className="font-semibold mb-4 text-white">For Creators</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/studio/create" className="text-gray-400 hover:text-white transition-colors">
                  Create Studio
                </Link>
              </li>
              <li>
                <Link href="/help/creator-guide" className="text-gray-400 hover:text-white transition-colors">
                  Creator Guide
                </Link>
              </li>
              <li>
                <Link href="/help/quality-standards" className="text-gray-400 hover:text-white transition-colors">
                  Quality Standards
                </Link>
              </li>
              <li>
                <Link href="/help/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing Guide
                </Link>
              </li>
              <li>
                <Link href="/help/payouts" className="text-gray-400 hover:text-white transition-colors">
                  Payouts
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/help/printing" className="text-gray-400 hover:text-white transition-colors">
                  Printing Tips
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-400 hover:text-white transition-colors">
                  Community
                </Link>
              </li>
            </ul>
            
            {/* Newsletter Signup */}
            <div className="bg-cardbackground border border-gray-700 rounded-lg p-4">
              <h5 className="font-medium text-white mb-2 text-sm">Stay Updated</h5>
              <p className="text-gray-400 text-xs mb-3">
                Get the latest releases and creator content.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-primarybackground border border-gray-600 rounded-l-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
                <button className="bg-primary text-black px-3 py-2 rounded-r-md hover:bg-primary/90 transition-colors">
                  <FaEnvelope className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <p>&copy; 2025 STLForge. All rights reserved.</p>
              <div className="flex space-x-6">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Made with ❤️ for the 3D printing community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
