const HeroSection = () => {
  return (
    <section className="text-center mb-12 py-8">
      <div className="relative">
        <div className="space-y-2 mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Discover the Truth
          </h1>
          <div className="flex justify-center">
            <div className="h-1 w-20 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full"></div>
          </div>
        </div>
        
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Our 100% free fact-checking tool helps you determine the truth of any statement with clarity and confidence.
        </p>
        <p className="text-blue-500 max-w-xl mx-auto mt-3 font-medium">
          Powered by Wikipedia - completely free, no API key needed.
        </p>
        
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
