const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">FactCheck</h3>
            <p className="text-sm">
              A platform committed to promoting truth and combating misinformation through reliable fact-checking.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Methodology</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Sources</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Research Papers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-center">
          <p>© {new Date().getFullYear()} FactCheck. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
