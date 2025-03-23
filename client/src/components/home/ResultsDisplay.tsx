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
    <section className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold">Verification Results</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShareResults}
            title="Share results"
            className="text-gray-500 hover:text-primary p-1 rounded focus:outline-none"
          >
            <Share2Icon className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSaveToHistory}
            title="Save to history"
            className="text-gray-500 hover:text-primary p-1 rounded focus:outline-none"
          >
            <BookmarkIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Statement being verified */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-1">Verified Statement:</h3>
        <p className="text-gray-800 font-medium">{result.statement}</p>
      </div>
      
      {/* Truth meter visualization */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>False</span>
          <span>Partially True</span>
          <span>True</span>
        </div>
        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getTruthMeterColor(result.truthScore)} ${getTruthMeterWidthClass(result.truthScore)} rounded-full`}
          ></div>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center">
            <span className={`font-semibold text-lg ${getTruthRatingColorClass(result.truthRating)} bg-opacity-10 px-2 py-1 rounded text-opacity-100`}>
              {result.truthRating}
            </span>
            <span className="ml-2 text-gray-500 text-sm">(Rating: {result.truthScore}/10)</span>
          </div>
          <div className="text-sm text-gray-500">Verified on {formattedDate}</div>
        </div>
      </div>
      
      {/* Verification explanation */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Verification Analysis:</h3>
        <p className="text-gray-700 mb-4">{result.explanation}</p>
        
        {/* Expandable section for detailed analysis */}
        {result.detailedAnalysis && (
          <div>
            <Button 
              variant="link" 
              className="text-primary hover:text-blue-700 p-0 h-auto text-sm font-medium flex items-center focus:outline-none"
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            >
              <span>{showDetailedAnalysis ? "Hide detailed analysis" : "Show detailed analysis"}</span>
              {showDetailedAnalysis ? (
                <ChevronUpIcon className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              )}
            </Button>
            
            {showDetailedAnalysis && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                <p className="whitespace-pre-line">{result.detailedAnalysis}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Sources used */}
      <div>
        <h3 className="text-md font-semibold mb-2">Sources:</h3>
        {result.sources.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {result.sources.map((source, index) => (
              <li key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex justify-between">
                  <span className="font-medium">{source.name}</span>
                  {source.year && <span className="text-gray-500">{source.year}</span>}
                </div>
                <p className="text-gray-700 mt-1">{source.excerpt}</p>
                {source.url && (
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-blue-700 text-xs flex items-center mt-2"
                  >
                    View Source
                    <ExternalLinkIcon className="h-3 w-3 ml-1" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm italic">No sources available for this verification.</p>
        )}
      </div>
    </section>
  );
};

export default ResultsDisplay;
