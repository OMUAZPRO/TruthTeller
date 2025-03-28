import { Link } from "wouter";
import { useState, useEffect } from "react";
import { CheckCircleIcon, MenuIcon, XIcon } from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [randomFact, setRandomFact] = useState<number>(0);
  
  // Fun facts about misinformation
  const facts = [
    "Fact-checking before sharing helps reduce misinformation",
    "Always verify news with multiple sources",
    "Wikipedia has 100,000+ volunteer editors checking accuracy",
    "TruthHunter is 100% free with no API keys needed"
  ];
  
  // Check if page is scrolled for header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Rotate through facts
  useEffect(() => {
    const interval = setInterval(() => {
      setRandomFact(prev => (prev + 1) % facts.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [facts.length]);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white bg-opacity-90 backdrop-blur-sm shadow-md py-2" 
          : "bg-white bg-opacity-80 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top announcement bar with rotating facts */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="fun-text text-2xl font-bold group flex items-center">
              <span className="group-hover:animate-pulse transition-all">TruthHunter</span>
              <CheckCircleIcon className="ml-1 h-5 w-5 text-blue-500 group-hover:text-blue-600 group-hover:animate-bounce" />
            </Link>
            
            <div className="ml-3 text-gray-500 text-xs md:text-sm font-light hidden sm:flex items-center overflow-hidden h-6">
              <div className="bg-blue-50 px-2 py-0.5 rounded-full flex items-center animate-float">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse mr-1.5"></span>
                <span className="animate-fadeIn">{facts[randomFact]}</span>
              </div>
            </div>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-5">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group px-2 py-1"
            >
              <span>Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <a 
              href="https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group px-2 py-1"
            >
              <span>About Sources</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="https://en.wikipedia.org/wiki/Wikipedia:Verifiability"
              target="_blank"
              rel="noopener noreferrer" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group px-2 py-1"
            >
              <span>Verification Standards</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors p-1 rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-fadeIn">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-1.5 hover:bg-blue-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <a 
                href="https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-1.5 hover:bg-blue-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Sources
              </a>
              <a
                href="https://en.wikipedia.org/wiki/Wikipedia:Verifiability"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-1.5 hover:bg-blue-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Verification Standards
              </a>
              <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                {facts[randomFact]}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
