import { HeartIcon, BookOpenIcon, CheckCircleIcon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-indigo-50 text-gray-600 py-10 mt-16 shadow-inner">
      {/* Decorative floating elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mt-32 -mr-32 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mb-32 -ml-32 animate-blob"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-blue-100">
          <div className="text-center md:text-left animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <h3 className="fun-text text-xl font-bold mb-3 flex items-center justify-center md:justify-start">
              <span>TruthHunter</span>
              <CheckCircleIcon className="ml-1 h-5 w-5 text-blue-500" />
            </h3>
            <p className="text-sm max-w-md mx-auto md:mx-0 text-gray-600">
              Finding truth in a sea of information, one fact at a time. Our free news verification platform helps you cut through misinformation.
            </p>
            <div className="mt-4 flex justify-center md:justify-start space-x-3">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="inline-block h-2 w-2 rounded-full bg-indigo-400 animate-pulse" style={{animationDelay: '0.2s'}}></span>
              <span className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{animationDelay: '0.4s'}}></span>
            </div>
          </div>
          
          <div className="text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-blue-600 font-medium mb-3 flex items-center justify-center">
              <BookOpenIcon className="h-4 w-4 mr-1" />
              <span>Useful Resources</span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Wikipedia Reliable Sources
                </a>
              </li>
              <li>
                <a 
                  href="https://en.wikipedia.org/wiki/Wikipedia:Verifiability" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Verification Standards
                </a>
              </li>
              <li>
                <a 
                  href="https://en.wikipedia.org/wiki/Misinformation" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Understanding Misinformation
                </a>
              </li>
            </ul>
          </div>
          
          <div className="text-center md:text-right animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <h4 className="text-blue-600 font-medium mb-3 flex items-center justify-center md:justify-end">
              <HeartIcon className="h-4 w-4 mr-1" />
              <span>Support the Project</span>
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Help us improve this free service by contributing to Wikipedia.
            </p>
            <a 
              href="https://donate.wikimedia.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Support Wikipedia
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-4 text-sm text-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <p className="text-gray-500">
            © {new Date().getFullYear()} TruthHunter. All rights reserved. Powered by Wikipedia.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            We do not store your personal information. All news verification runs entirely in your browser.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
