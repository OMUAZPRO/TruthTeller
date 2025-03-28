import { FloatingElements } from "@/components/ui/floating-elements";

const HeroSection = () => {
  return (
    <section className="text-center mb-12 py-12 relative overflow-hidden w-full">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <FloatingElements 
          density="low"  // Reduced density to improve performance
          speed="slow" 
          type="shapes" 
          color="mixed" 
          interactive={false} 
        />
      </div>

      {/* Main hero content */}
      <div className="relative z-10 w-full">
        <div className="space-y-2 mb-8 animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 fun-text animate-gentle-pulse">
            TruthHunter
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-700">
            Verify News Instantly
          </h2>
          <div className="flex justify-center">
            <div className="h-1 w-32 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full animate-shimmer"></div>
          </div>
        </div>
        
        <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Our 100% free news verification tool helps you cut through misinformation and confirm the accuracy of news articles and headlines.
          </p>
          <p className="text-blue-600 max-w-xl mx-auto mt-3 font-medium animate-float">
            Powered by Wikipedia - completely free, no API key needed
          </p>
        </div>
        
        {/* How it works section - enhanced with animations */}
        <div className="mt-10 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="bg-white bg-opacity-80 p-5 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-all group animate-float animation-delay-100">
            <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Enter News Headline</h3>
            <p className="text-sm text-gray-600">Paste any news headline or claim you want to verify in seconds</p>
          </div>
          
          <div className="bg-white bg-opacity-80 p-5 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-all group animate-float animation-delay-200">
            <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Analysis</h3>
            <p className="text-sm text-gray-600">Our system searches multiple reliable sources to analyze the claim</p>
          </div>
          
          <div className="bg-white bg-opacity-80 p-5 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-all group animate-float animation-delay-300">
            <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-purple-100 text-purple-500 mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Get Results</h3>
            <p className="text-sm text-gray-600">Receive an accuracy rating with detailed explanation and sources</p>
          </div>
        </div>
        
        {/* Animated indicators */}
        <div className="mt-10 flex justify-center space-x-3 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-400 animate-pulse" style={{animationDelay: '0.2s'}}></span>
          <span className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{animationDelay: '0.4s'}}></span>
        </div>
        
        {/* Fun tagline */}
        <div className="mt-8 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
          <p className="italic text-gray-500 text-sm">
            "Because not everything you read on the internet is true"
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
