import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatementForm from "@/components/home/StatementForm";
import ResultsDisplay from "@/components/home/ResultsDisplay";
import HistorySection from "@/components/home/HistorySection";
import { VerificationResponse } from "@shared/types";

const Home = () => {
  // State to track the current verification result
  const [currentResult, setCurrentResult] = useState<(VerificationResponse & { id: number }) | null>(null);

  // Handle verification completion
  const handleVerificationComplete = (data: VerificationResponse & { id: number }) => {
    setCurrentResult(data);
    // Scroll to results
    setTimeout(() => {
      window.scrollTo({
        top: document.getElementById("results-anchor")?.offsetTop || 0,
        behavior: "smooth"
      });
    }, 100);
  };

  // Handle when a user selects a result from history
  const handleSelectResult = (result: VerificationResponse & { id: number }) => {
    setCurrentResult(result);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-indigo-50 font-sans text-gray-800 min-h-screen flex flex-col">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="relative">
          {/* Decorative elements for relaxing mood */}
          <div className="absolute top-10 left-0 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-10 right-0 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-32 h-32 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          
          <div className="relative">
            <HeroSection />
            <StatementForm onVerificationComplete={handleVerificationComplete} />
            
            <div id="results-anchor"></div>
            {currentResult && <ResultsDisplay result={currentResult} />}
            
            <HistorySection onSelectResult={handleSelectResult} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
