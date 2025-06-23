export function Footer() {
  return (
    <footer className="bg-muted/50 bg-[#272D31]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">3D</span>
              </div>
              <span className="text-xl font-bold">MiniForge</span>
            </div>
            <p className="text-muted-foreground">
              The ultimate marketplace for premium 3D printable miniatures. Join thousands of creators and gamers worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Browse</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">All STL Files</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Fantasy Collection</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Sci-Fi Collection</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">New Releases</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Top Rated</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Free STLs</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Creator Guide</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Printing Tips</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Quality Standards</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Community Forum</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-muted-foreground mb-4">
              Get the latest STL releases and exclusive creator content delivered to your inbox.
            </p>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-muted-foreground">
          <p>&copy; 2024 MiniForge. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}