import { useState } from "react";
import { 
  getTruthRatingColorClass, 
  getTruthMeterWidthClass, 
  getTruthMeterColor,
  VerificationResponse
} from "@shared/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Share2Icon, BookmarkIcon, ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from "lucide-react";

interface ResultsDisplayProps {
  result: VerificationResponse & { id: number };
}

const ResultsDisplay = ({ result }: ResultsDisplayProps) => {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const { toast } = useToast();
  
  // Format verification date
  const formattedDate = format(new Date(result.verifiedAt), "MMM d, yyyy");
  
  // Handle share results
  const handleShareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: "FactCheck Result",
        text: `"${result.statement}" is rated ${result.truthRating} by FactCheck.`,
        url: window.location.href,
      }).catch((error) => {
        console.error("Error sharing:", error);
      });
    } else {
      // Fallback to clipboard copy
      navigator.clipboard.writeText(
        `"${result.statement}" is rated ${result.truthRating} by FactCheck. Truth score: ${result.truthScore}/10. ${window.location.href}`
      ).then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The verification result has been copied to your clipboard.",
        });
      }).catch((error) => {
        console.error("Error copying to clipboard:", error);
      });
    }
  };
  
  // Handle save to history
  const handleSaveToHistory = () => {
    toast({
      title: "Saved to history",
      description: "This fact check is automatically saved to your history.",
    });
  };

  return (
    <section className="relative card rounded-xl p-8 mb-8 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      
      <div className="relative">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Verification Results
            </h2>
            <div className="ml-2 flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShareResults}
              title="Share results"
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 flex items-center px-3 py-1 rounded-lg transition-all duration-300"
            >
              <Share2Icon className="h-4 w-4 mr-1" />
              <span>Share</span>
            </Button>
            <Button 
              variant="outline"
              size="sm" 
              onClick={handleSaveToHistory}
              title="Save to history"
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 flex items-center px-3 py-1 rounded-lg transition-all duration-300"
            >
              <BookmarkIcon className="h-4 w-4 mr-1" />
              <span>Save</span>
            </Button>
          </div>
        </div>
        
        {/* Statement being verified */}
        <div className="mb-8 p-5 bg-white bg-opacity-80 rounded-lg border border-blue-100 shadow-sm">
          <h3 className="text-sm font-medium text-blue-600 mb-2">Verified Statement:</h3>
          <p className="text-gray-800 font-medium text-lg">{result.statement}</p>
        </div>
        
        {/* Truth meter visualization - enhanced version */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-red-500">False</span>
            <span className="text-yellow-500">Partially True</span>
            <span className="text-green-500">True</span>
          </div>
          <div className="h-8 bg-gray-100 rounded-full overflow-hidden p-1">
            <div 
              className={`h-full ${getTruthMeterColor(result.truthScore)} ${getTruthMeterWidthClass(result.truthScore)} rounded-full transition-all duration-1000 ease-out`}
              style={{transition: 'width 1.5s ease-out'}}
            ></div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <span className={`font-bold text-xl ${getTruthRatingColorClass(result.truthRating)} px-3 py-1 rounded-lg shadow-sm`}>
                {result.truthRating}
              </span>
              <span className="ml-3 text-gray-500 text-sm font-medium">Score: {result.truthScore}/10</span>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block mr-2"></span>
              Verified on {formattedDate}
            </div>
          </div>
        </div>
        
        {/* Verification explanation */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Analysis Summary:</h3>
          <p className="text-gray-700 leading-relaxed mb-4 bg-white bg-opacity-60 p-4 rounded-lg">{result.explanation}</p>
          
          {/* Expandable section for detailed analysis */}
          {result.detailedAnalysis && (
            <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-blue-50">
              <Button 
                variant="ghost" 
                className="text-blue-600 hover:text-blue-800 p-0 h-auto text-sm font-medium flex items-center focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg w-full justify-between"
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              >
                <span>{showDetailedAnalysis ? "Hide Detailed Analysis" : "Show Detailed Analysis"}</span>
                {showDetailedAnalysis ? (
                  <ChevronUpIcon className="h-5 w-5 ml-1 text-blue-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 ml-1 text-blue-500" />
                )}
              </Button>
              
              {showDetailedAnalysis && (
                <div className="mt-3 text-sm text-gray-700 leading-relaxed animate-fadeIn">
                  <p className="whitespace-pre-line">{result.detailedAnalysis}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Sources used */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span>Source Information</span>
            <div className="ml-2 h-px flex-grow bg-gradient-to-r from-blue-300 to-transparent"></div>
          </h3>
          
          {result.sources.length > 0 ? (
            <ul className="space-y-3">
              {result.sources.map((source, index) => (
                <li key={index} className="p-4 bg-white bg-opacity-70 rounded-lg border border-blue-50 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{source.name}</span>
                    {source.year && <span className="text-blue-500 text-sm font-medium bg-blue-50 px-2 py-1 rounded">{source.year}</span>}
                  </div>
                  <p className="text-gray-700 mt-2 text-sm leading-relaxed border-l-2 border-blue-100 pl-3 ml-1">{source.excerpt}</p>
                  
                  {source.url && (
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-3 transition-colors"
                    >
                      <span>View Original Source</span>
                      <ExternalLinkIcon className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-blue-50 bg-opacity-50 rounded-lg text-center">
              <p className="text-blue-600 text-sm italic">No additional sources were available for this verification.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResultsDisplay;
