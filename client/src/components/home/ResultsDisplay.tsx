import { useState, useEffect } from "react";
import { 
  getTruthRatingColorClass, 
  getTruthMeterWidthClass, 
  getTruthMeterColor,
  VerificationResponse
} from "@shared/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2Icon, BookmarkIcon, ChevronDownIcon, 
  ChevronUpIcon, ExternalLinkIcon, ThumbsUpIcon,
  ThumbsDownIcon, InfoIcon, AlertCircleIcon
} from "lucide-react";

interface ResultsDisplayProps {
  result: VerificationResponse & { id: number };
}

// Fun facts about fact-checking
const FUN_FACTS = [
  "Studies show we're more likely to remember and share emotionally charged news, whether it's true or not.",
  "The term 'yellow journalism' originated in the 1890s to describe sensationalist newspaper reporting.",
  "Wikipedia has over 100,000 active volunteer editors who help maintain accuracy across articles.",
  "The first dedicated political fact-checking site, FactCheck.org, was launched in 2003.",
  "News verification technology helps identify misleading images that have been manipulated or taken out of context.",
  "Most misinformation contains a grain of truth that's been distorted or taken out of context.",
];

const ResultsDisplay = ({ result }: ResultsDisplayProps) => {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const { toast } = useToast();
  const [currentFact, setCurrentFact] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'unhelpful' | null>(null);
  
  // Rotate through fun facts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % FUN_FACTS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Trigger animations
  useEffect(() => {
    if (!hasAnimated) {
      setHasAnimated(true);
      setTimeout(() => {
        setAnimationComplete(true);
      }, 2000);
    }
  }, [hasAnimated]);
  
  // Format verification date
  const formattedDate = format(new Date(result.verifiedAt), "MMM d, yyyy");
  
  // Handle share results
  const handleShareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: "TruthHunter News Verification",
        text: `"${result.statement}" is rated ${result.truthRating} by TruthHunter News Verification.`,
        url: window.location.href,
      }).catch((error) => {
        console.error("Error sharing:", error);
      });
    } else {
      // Fallback to clipboard copy
      navigator.clipboard.writeText(
        `"${result.statement}" is rated ${result.truthRating} by TruthHunter News Verification. Truth score: ${result.truthScore}/10. ${window.location.href}`
      ).then(() => {
        toast({
          title: "Copied to clipboard! 📋",
          description: "The verification result has been copied to your clipboard.",
          variant: "default",
        });
      }).catch((error) => {
        console.error("Error copying to clipboard:", error);
      });
    }
  };
  
  // Handle save to history
  const handleSaveToHistory = () => {
    toast({
      title: "Saved to your history! 📚",
      description: "This fact check is automatically saved to your history.",
      variant: "default",
    });
  };
  
  // Handle user feedback
  const handleFeedback = (type: 'helpful' | 'unhelpful') => {
    setFeedbackGiven(type);
    toast({
      title: type === 'helpful' ? "Thanks for your feedback! 🙌" : "Thanks for letting us know! 🤔",
      description: type === 'helpful' 
        ? "We're glad this verification was helpful to you!" 
        : "We'll work to improve our verification process.",
      variant: "default",
    });
  };

  return (
    <section className="relative card rounded-xl p-8 mb-8 overflow-hidden animate-fadeIn">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/2 right-10 w-16 h-16 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-300"></div>
      <div className="absolute bottom-1/4 left-10 w-12 h-12 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-200"></div>
      
      <div className="relative">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold fun-text animate-gentle-pulse">
              News Verification Results
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
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 flex items-center px-3 py-1 rounded-lg transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: '0.3s' }}
            >
              <Share2Icon className="h-4 w-4 mr-1" />
              <span>Share</span>
            </Button>
            <Button 
              variant="outline"
              size="sm" 
              onClick={handleSaveToHistory}
              title="Save to history"
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 flex items-center px-3 py-1 rounded-lg transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: '0.5s' }}
            >
              <BookmarkIcon className="h-4 w-4 mr-1" />
              <span>Save</span>
            </Button>
          </div>
        </div>
        
        {/* Statement being verified */}
        <div className="mb-8 p-5 bg-white bg-opacity-80 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow animate-breath">
          <h3 className="text-sm font-medium text-blue-600 mb-2">Verified News Headline:</h3>
          <p className="text-gray-800 font-medium text-lg">{result.statement}</p>
          
          {/* News source indicator if present */}
          {result.statement.includes(':') && (
            <div className="mt-2 bg-blue-50 px-3 py-1 rounded-md inline-block animate-fadeIn">
              <span className="text-xs font-medium text-blue-700">
                Source: {result.statement.split(':')[0].trim()}
              </span>
            </div>
          )}
        </div>
        
        {/* Truth meter visualization - enhanced version */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-red-500">False</span>
            <span className="text-yellow-500">Partially True</span>
            <span className="text-green-500">True</span>
          </div>
          <div className="h-8 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner">
            <div 
              className={`h-full ${getTruthMeterColor(result.truthScore)} ${getTruthMeterWidthClass(result.truthScore)} rounded-full transition-all duration-1000 ease-out relative`}
              style={{transition: 'width 1.5s ease-out'}}
            >
              {/* Shimmer effect inside the truth meter */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <span className={`font-bold text-xl ${getTruthRatingColorClass(result.truthRating)} px-3 py-1 rounded-lg shadow-sm animate-fadeIn`}>
                {result.truthRating}
              </span>
              <span className="ml-3 text-gray-500 text-sm font-medium">Score: {result.truthScore}/10</span>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block mr-2 animate-pulse"></span>
              Verified on {formattedDate}
            </div>
          </div>
        </div>
        
        {/* Fun fact box */}
        <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm cursor-pointer animate-fadeIn animate-float" 
             style={{ animationDelay: '0.4s' }}
             onClick={() => setCurrentFact((prev) => (prev + 1) % FUN_FACTS.length)}>
          <div className="flex items-start">
            <div className="bg-indigo-100 rounded-full p-2 mr-3 flex-shrink-0">
              <InfoIcon className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-800 mb-1">Did you know?</h4>
              <p className="text-sm text-indigo-700">{FUN_FACTS[currentFact]}</p>
              <p className="text-xs text-indigo-500 mt-2 italic">Click for another interesting fact</p>
            </div>
          </div>
        </div>
        
        {/* Verification explanation */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span>News Analysis Summary</span>
            <div className="ml-2 h-px w-16 bg-gradient-to-r from-blue-300 to-transparent"></div>
          </h3>
          
          {/* Check for sensationalism */}
          {result.explanation.includes("sensationalistic") && (
            <div className="bg-amber-50 p-3 mb-4 rounded-lg border border-amber-200 flex items-center animate-fadeIn">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-amber-800">
                This news headline contains potentially sensationalistic language, which may exaggerate or dramatize the facts.
              </p>
            </div>
          )}
          
          {/* Main explanation */}
          <div className="bg-white bg-opacity-60 p-5 rounded-lg shadow-sm mb-4 hover:shadow-md transition-shadow animate-breath">
            <p className="text-gray-700 leading-relaxed">{result.explanation}</p>
            
            {/* Additional news context */}
            <div className="mt-4 pt-3 border-t border-blue-100">
              <h4 className="text-sm font-medium text-blue-700 mb-2">What This Means:</h4>
              <p className="text-sm text-gray-600">
                {result.truthScore > 7 ? 
                  "This news headline appears to be accurate based on reliable sources. It can likely be trusted." :
                  result.truthScore > 4 ?
                  "This news headline contains some accurate elements but may be missing context or contains some inaccuracies." :
                  "This news headline contains significant inaccuracies or makes claims that are not supported by reliable sources."
                }
              </p>
            </div>
          </div>
          
          {/* Expandable section for detailed analysis */}
          {result.detailedAnalysis && (
            <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-blue-50 animate-breath">
              <Button 
                variant="ghost" 
                className="text-blue-600 hover:text-blue-800 p-0 h-auto text-sm font-medium flex items-center focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg w-full justify-between group"
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              >
                <span className="group-hover:underline">{showDetailedAnalysis ? "Hide Detailed Analysis" : "Show Detailed Analysis"}</span>
                {showDetailedAnalysis ? (
                  <ChevronUpIcon className="h-5 w-5 ml-1 text-blue-500 group-hover:animate-bounce" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 ml-1 text-blue-500 group-hover:animate-bounce" />
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
        
        {/* User feedback section */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <h4 className="text-sm font-medium text-blue-700 mb-2">Was this verification helpful?</h4>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              size="sm" 
              onClick={() => handleFeedback('helpful')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                feedbackGiven === 'helpful' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'
              }`}
              disabled={feedbackGiven !== null}
            >
              <ThumbsUpIcon className="h-4 w-4 mr-2" />
              <span>Yes, helpful</span>
            </Button>
            <Button 
              variant="outline"
              size="sm" 
              onClick={() => handleFeedback('unhelpful')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                feedbackGiven === 'unhelpful' 
                  ? 'bg-red-100 text-red-700 border-red-200' 
                  : 'text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
              }`}
              disabled={feedbackGiven !== null}
            >
              <ThumbsDownIcon className="h-4 w-4 mr-2" />
              <span>No, needs improvement</span>
            </Button>
          </div>
          {feedbackGiven && (
            <p className="text-xs text-blue-600 mt-2 animate-fadeIn">
              Thank you for your feedback! It helps us improve our news verification system.
            </p>
          )}
        </div>
        
        {/* Sources used */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.7s' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span>Referenced Sources</span>
            <div className="ml-2 h-px flex-grow bg-gradient-to-r from-blue-300 to-transparent"></div>
          </h3>
          
          {result.sources.length > 0 ? (
            <>
              <div className="mb-4 p-4 bg-blue-50 bg-opacity-90 rounded-lg border border-blue-100 animate-breath">
                <p className="text-sm text-blue-700 flex items-start">
                  <AlertCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                  <span>
                    The following sources were used to verify this news claim. Wikipedia content is generally reliable but can change over time. 
                    For definitive news verification, consult multiple specialized fact-checking organizations.
                  </span>
                </p>
              </div>
              
              <ul className="space-y-3">
                {result.sources.map((source, index) => (
                  <li 
                    key={index} 
                    className="p-4 bg-white bg-opacity-80 rounded-lg border border-blue-50 shadow-sm transition-all duration-300 hover:shadow-md group animate-fadeIn"
                    style={{ animationDelay: `${0.8 + (index * 0.1)}s` }}
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="font-semibold text-gray-800">{source.name}</span>
                      <div className="flex items-center space-x-2">
                        {source.year && <span className="fun-badge">{source.year}</span>}
                        <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded">Wikipedia</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mt-2 text-sm leading-relaxed border-l-2 border-blue-100 pl-3 ml-1">{source.excerpt}</p>
                    
                    <div className="mt-3 flex justify-between items-center">
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors group-hover:underline"
                        >
                          <span>View Source Article</span>
                          <ExternalLinkIcon className="h-3 w-3 ml-1" />
                        </a>
                      )}
                      
                      <span className="text-xs bg-gray-50 px-2 py-0.5 rounded text-gray-500 italic">
                        Reference #{index + 1}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-5 text-center">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-xs inline-flex items-center text-blue-500 hover:text-blue-700 transition-colors px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Return to top
                </button>
                <p className="text-xs text-gray-500 italic mt-2">
                  Sources last updated: {formattedDate}
                </p>
              </div>
            </>
          ) : (
            <div className="p-5 bg-blue-50 bg-opacity-70 rounded-lg text-center border border-blue-100 animate-breath">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 animate-gentle-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-blue-600 text-base font-medium">No additional sources were available for this verification.</p>
                <p className="text-sm text-blue-500 mt-2">Try adding more specific details to get better results!</p>
                
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="mt-4 text-sm px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Try Another Statement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResultsDisplay;
