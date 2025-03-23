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
    <div className="bg-gray-50 font-sans text-gray-800 min-h-screen flex flex-col">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <HeroSection />
        <StatementForm onVerificationComplete={handleVerificationComplete} />
        
        <div id="results-anchor"></div>
        {currentResult && <ResultsDisplay result={currentResult} />}
        
        <HistorySection onSelectResult={handleSelectResult} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
