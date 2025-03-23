const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-600 py-6 mt-12 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <h3 className="text-primary font-semibold text-lg mb-2">TruthHunter</h3>
          <p className="text-sm max-w-md mx-auto">
            Finding truth in a sea of information, one fact at a time.
          </p>
          <div className="mt-4">
            <div className="flex justify-center space-x-4">
              <span className="inline-block h-1 w-1 rounded-full bg-blue-300"></span>
              <span className="inline-block h-1 w-1 rounded-full bg-indigo-300"></span>
              <span className="inline-block h-1 w-1 rounded-full bg-purple-300"></span>
            </div>
          </div>
        </div>
        <div className="mt-6 text-sm text-center">
          <p>© {new Date().getFullYear()} TruthHunter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
