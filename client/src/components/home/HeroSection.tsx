const HeroSection = () => {
  return (
    <section className="text-center mb-12 py-8">
      <div className="relative">
        <div className="space-y-2 mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Verify News Instantly
          </h1>
          <div className="flex justify-center">
            <div className="h-1 w-20 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full"></div>
          </div>
        </div>
        
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Our 100% free news verification tool helps you cut through misinformation and confirm the accuracy of news articles and headlines.
        </p>
        <p className="text-blue-500 max-w-xl mx-auto mt-3 font-medium">
          Powered by Wikipedia - completely free, no API key needed.
        </p>
        
        {/* How it works section */}
        <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm border border-blue-50 hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">Enter News Headline</h3>
            <p className="text-sm text-gray-600">Paste any news headline or claim you want to verify</p>
          </div>
          
          <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm border border-blue-50 hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">Advanced Analysis</h3>
            <p className="text-sm text-gray-600">Our AI searches reliable sources to analyze the claim</p>
          </div>
          
          <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm border border-blue-50 hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-purple-100 text-purple-500 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">Get Results</h3>
            <p className="text-sm text-gray-600">Receive an accuracy rating with detailed explanation</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center space-x-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" style={{animationDelay: '0.2s'}}></span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" style={{animationDelay: '0.4s'}}></span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
