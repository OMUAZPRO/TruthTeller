import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { VerificationResponse } from "@shared/types";
import { getTruthRatingColorClass, getTruthMeterColor } from "@shared/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, ClockIcon, HistoryIcon, BookOpenIcon, CheckIcon, XIcon, AlertTriangleIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FunLoader } from "@/components/ui/fun-loader";

// Number of items to load per page
const ITEMS_PER_PAGE = 3;

interface HistorySectionProps {
  onSelectResult: (result: VerificationResponse & { id: number }) => void;
}

const HistorySection = ({ onSelectResult }: HistorySectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<(VerificationResponse & { id: number })[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  
  // Fetch statements
  const { data: statements, isLoading, error } = useQuery<(VerificationResponse & { id: number })[]>({
    queryKey: ["/api/statements", searchQuery],
    staleTime: 30000, // 30 seconds
  });
  
  // Effect to filter results based on search
  useEffect(() => {
    if (!statements) return;
    
    if (searchQuery.trim() === "") {
      setFilteredResults(statements);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      
      // Debounce search for better UX
      if (searchDebounce) clearTimeout(searchDebounce);
      
      const timer = setTimeout(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = statements.filter(statement => 
          statement.statement.toLowerCase().includes(lowerQuery) ||
          statement.explanation.toLowerCase().includes(lowerQuery)
        );
        setFilteredResults(filtered);
        setIsSearching(false);
      }, 300);
      
      setSearchDebounce(timer);
    }
    
    // Reset visible count when search changes
    setVisibleCount(ITEMS_PER_PAGE);
    
    return () => {
      if (searchDebounce) clearTimeout(searchDebounce);
    };
  }, [statements, searchQuery]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Load more results with animation
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };
  
  // View full results
  const handleViewFullResults = (item: VerificationResponse & { id: number }) => {
    onSelectResult(item);
    
    // Scroll to top to see results with smooth animation
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  
  // Function to get appropriate icon based on truth rating
  const getTruthIcon = (truthRating: string) => {
    if (truthRating === "True" || truthRating === "Mostly True") {
      return <CheckIcon className="h-4 w-4 text-green-500" />;
    } else if (truthRating === "False" || truthRating === "Mostly False") {
      return <XIcon className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Render appropriate loading or error states
  if (isLoading) {
    return (
      <section className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-md p-6 animate-fadeIn animate-breath">
        <h2 className="text-xl font-bold fun-text flex items-center mb-6">
          <HistoryIcon className="h-5 w-5 mr-2 text-blue-500" />
          Your Verification History
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-blue-100 rounded-lg overflow-hidden p-5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
              <Skeleton className="h-6 w-3/4 mb-2 bg-blue-50" />
              <Skeleton className="h-4 w-full mb-2 bg-blue-50" />
              <Skeleton className="h-4 w-full mb-3 bg-blue-50" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20 bg-blue-50" />
                <Skeleton className="h-3 w-24 bg-blue-50" />
              </div>
            </div>
          ))}
          <div className="flex justify-center mt-4">
            <FunLoader type="dots" size="small" text="Loading history..." colorClass="text-blue-500" />
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-md p-6 animate-fadeIn">
        <h2 className="text-xl font-bold fun-text flex items-center mb-4">
          <HistoryIcon className="h-5 w-5 mr-2 text-blue-500" />
          Your Verification History
        </h2>
        <div className="p-5 border border-red-200 rounded-lg bg-red-50 text-red-800 animate-fadeIn">
          <div className="flex items-start">
            <div className="mr-3 bg-red-100 rounded-full p-2">
              <AlertTriangleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium">Error loading history</p>
              <p className="text-sm mt-1">{error instanceof Error ? error.message : "Unknown error"}</p>
              <p className="text-xs mt-2">Try refreshing the page to resolve this issue.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const visibleResults = filteredResults.slice(0, visibleCount);
  const hasMore = visibleCount < filteredResults.length;

  return (
    <section className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-md p-6 animate-fadeIn relative overflow-hidden w-full">
      {/* Decorative bubbles */}
      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
      
      <div className="relative w-full">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold fun-text flex items-center animate-fadeIn">
            <HistoryIcon className="h-5 w-5 mr-2 text-blue-500" />
            Your Verification History
          </h2>
          
          {/* Search functionality with animation */}
          <div className="relative w-full sm:w-64 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <Input 
              type="text" 
              placeholder="Search your history..." 
              className="w-full pl-10 pr-4 py-2 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-100 transition-all rounded-lg"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
              <SearchIcon className="h-5 w-5" />
            </div>
            
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* History list with animations */}
        {visibleResults.length > 0 ? (
          <div className="space-y-4">
            {visibleResults.map((item, index) => (
              <div 
                key={item.id} 
                className="border border-blue-100 rounded-lg overflow-hidden bg-white hover:shadow-md transition-all animate-fadeIn group"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2">{item.statement}</h3>
                    <div className="flex items-center ml-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full text-white ${getTruthRatingColorClass(
                          item.truthRating
                        )} flex items-center space-x-1 shadow-sm`}
                      >
                        {getTruthIcon(item.truthRating)}
                        <span className="ml-1">{item.truthRating}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar visualization */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                    <div 
                      className={`h-full ${getTruthMeterColor(item.truthScore)} rounded-full`}
                      style={{ width: `${item.truthScore * 10}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 group-hover:text-gray-700 transition-colors">{item.explanation}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {format(new Date(item.verifiedAt), 'MMM d, yyyy')}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-2 h-auto text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium rounded-lg flex items-center group-hover:underline transition-colors"
                      onClick={() => handleViewFullResults(item)}
                    >
                      <BookOpenIcon className="h-3.5 w-3.5 mr-1" />
                      <span>View Full Results</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Load more button with animation */}
            {hasMore && (
              <div className="text-center pt-4 animate-fadeIn">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400 font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
                  onClick={handleLoadMore}
                >
                  <span>Load More Results</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </div>
            )}
            
            {/* Count indicator */}
            <div className="text-center text-xs text-gray-500 pt-2 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              Showing {visibleResults.length} of {filteredResults.length} results
            </div>
          </div>
        ) : (
          <div className="text-center py-8 animate-fadeIn">
            {searchQuery.trim() !== "" ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <SearchIcon className="h-8 w-8 text-blue-300" />
                </div>
                <p className="text-blue-500 font-medium">No results found for "{searchQuery}"</p>
                <p className="text-gray-500 text-sm mt-1">Try a different search term or clear your search</p>
                <Button
                  variant="link"
                  className="mt-2 text-blue-600"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-3 animate-gentle-pulse">
                  <HistoryIcon className="h-8 w-8 text-indigo-300" />
                </div>
                <p className="text-indigo-500 font-medium">No verification history yet</p>
                <p className="text-gray-500 text-sm mt-1">Start by submitting a news headline above</p>
                <Button
                  variant="link"
                  className="mt-2 text-indigo-600"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Go to Verification Form
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HistorySection;
