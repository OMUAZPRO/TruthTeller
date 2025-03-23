import { Link } from "wouter";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          <div className="flex items-center">
            <Link href="/" className="text-primary text-2xl font-bold">
              TruthHunter
            </Link>
            <span className="ml-2 text-gray-500 font-light hidden sm:inline">News Verification Platform</span>
          </div>
          <nav className="flex space-x-4">
            <Link href="/" className="text-dark hover:text-primary font-medium transition-colors">
              Home
            </Link>
            <button className="text-gray-500 hover:text-primary font-medium transition-colors">About</button>
            <button className="text-gray-500 hover:text-primary font-medium transition-colors">FAQ</button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
