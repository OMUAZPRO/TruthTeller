import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { VerificationResponse } from "@shared/types";
import { getTruthRatingColorClass } from "@shared/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Number of items to load per page
const ITEMS_PER_PAGE = 3;

interface HistorySectionProps {
  onSelectResult: (result: VerificationResponse & { id: number }) => void;
}

const HistorySection = ({ onSelectResult }: HistorySectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<(VerificationResponse & { id: number })[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
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
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = statements.filter(statement => 
        statement.statement.toLowerCase().includes(lowerQuery) ||
        statement.explanation.toLowerCase().includes(lowerQuery)
      );
      setFilteredResults(filtered);
    }
    // Reset visible count when search changes
    setVisibleCount(ITEMS_PER_PAGE);
  }, [statements, searchQuery]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Load more results
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };
  
  // View full results
  const handleViewFullResults = (item: VerificationResponse & { id: number }) => {
    onSelectResult(item);
    
    // Scroll to top to see results
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Render appropriate loading or error states
  if (isLoading) {
    return (
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Previously Checked Statements</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Previously Checked Statements</h2>
        <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
          <p>Error loading history: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </section>
    );
  }

  const visibleResults = filteredResults.slice(0, visibleCount);
  const hasMore = visibleCount < filteredResults.length;

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Previously Checked Statements</h2>
        
        {/* Search functionality */}
        <div className="relative w-full sm:w-64">
          <Input 
            type="text" 
            placeholder="Search history..." 
            className="w-full pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <SearchIcon className="h-5 w-5" />
          </div>
        </div>
      </div>
      
      {/* History list */}
      {visibleResults.length > 0 ? (
        <div className="space-y-4">
          {visibleResults.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">{item.statement}</h3>
                  <div className="flex items-center">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full text-white ${getTruthRatingColorClass(
                        item.truthRating
                      )}`}
                    >
                      {item.truthRating}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.explanation}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{format(new Date(item.verifiedAt), 'MMM d, yyyy')}</span>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary hover:text-blue-700 font-medium"
                    onClick={() => handleViewFullResults(item)}
                  >
                    View Full Results
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Load more button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button 
                variant="link" 
                className="text-primary hover:text-blue-700 font-medium"
                onClick={handleLoadMore}
              >
                Load More Results
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {searchQuery.trim() !== "" ? (
            <p>No results found for "{searchQuery}"</p>
          ) : (
            <p>No fact-checked statements yet. Start by submitting a statement above.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default HistorySection;
