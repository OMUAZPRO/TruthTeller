import { SourceInfo, VerificationResponse } from "@shared/types";
import { getTruthRating } from "@shared/types";

/**
 * Fact check a statement using Wikipedia content as a source
 * This is a completely free approach that doesn't require API keys
 */
export async function factCheckStatement(statement: string, context?: string): Promise<VerificationResponse> {
  try {
    // Extract key terms from the statement
    const searchTerm = getSearchTerm(statement);
    
    // Search Wikipedia for relevant articles
    const searchResults = await searchWikipedia(searchTerm);
    
    if (!searchResults.length) {
      return {
        statement,
        truthScore: 5,
        truthRating: getTruthRating(5),
        explanation: "No relevant information found to verify this statement. We cannot determine its accuracy.",
        sources: [],
        verifiedAt: new Date().toISOString()
      };
    }
    
    // Get content extracts for the top articles
    const articles = await Promise.all(
      searchResults.slice(0, 3).map(result => getWikipediaExtract(result.pageid))
    );
    
    // Create sources from the articles
    const sources: SourceInfo[] = articles.map(article => ({
      name: article.title,
      year: new Date().getFullYear().toString(), // Wikipedia is constantly updated
      excerpt: article.extract.substring(0, 200) + "...",
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replace(/ /g, '_'))}`
    }));
    
    // Analyze the statement against the articles
    const analysis = analyzeStatement(statement, articles);
    
    return {
      statement,
      truthScore: analysis.score,
      truthRating: getTruthRating(analysis.score),
      explanation: analysis.explanation,
      detailedAnalysis: analysis.detailedAnalysis,
      sources,
      verifiedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in fact checking statement:", error);
    
    // Return a fallback response for error cases
    return {
      statement,
      truthScore: 5,
      truthRating: getTruthRating(5),
      explanation: "We encountered an error while fact-checking this statement. Please try again later.",
      sources: [],
      verifiedAt: new Date().toISOString()
    };
  }
}

/**
 * Extract a search term from a statement
 */
function getSearchTerm(statement: string): string {
  // Remove common words and keep important ones
  const words = statement.toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .filter(word => 
      word.length > 2 && 
      !['the', 'and', 'that', 'this', 'with', 'from', 'will', 'have', 'has', 'had'].includes(word)
    );
  
  return words.slice(0, 5).join(' ');
}

// Interface for Wikipedia search result
interface WikiSearchResult {
  pageid: number;
  title: string;
  snippet: string;
}

/**
 * Search Wikipedia for articles related to the search term
 */
async function searchWikipedia(searchTerm: string): Promise<WikiSearchResult[]> {
  const endpoint = 'https://en.wikipedia.org/w/api.php';
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: searchTerm,
    format: 'json',
    origin: '*'
  });
  
  const response = await fetch(`${endpoint}?${params}`);
  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.query.search;
}

/**
 * Get a detailed extract from a Wikipedia article
 */
async function getWikipediaExtract(pageId: number) {
  const endpoint = 'https://en.wikipedia.org/w/api.php';
  const params = new URLSearchParams({
    action: 'query',
    pageids: pageId.toString(),
    prop: 'extracts|info',
    inprop: 'url',
    exintro: '1',
    explaintext: '1',
    format: 'json',
    origin: '*'
  });
  
  const response = await fetch(`${endpoint}?${params}`);
  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.status}`);
  }
  
  const data = await response.json();
  const page = data.query.pages[pageId];
  return {
    pageid: page.pageid,
    title: page.title,
    extract: page.extract || 'No extract available.'
  };
}

/**
 * Basic analysis of a statement against Wikipedia articles
 */
function analyzeStatement(statement: string, articles: Array<{title: string, extract: string}>) {
  const statementLower = statement.toLowerCase();
  let containsContradiction = false;
  let containsSupport = false;
  let contextualMatch = false;
  
  // Look for key terms in the extracts
  const statementTerms = getSearchTerm(statement).split(' ');
  const matchingTermsCount = statementTerms.filter(term => 
    articles.some(article => article.extract.toLowerCase().includes(term.toLowerCase()))
  ).length;
  
  // Calculate term match percentage
  const termMatchPercentage = statementTerms.length > 0 
    ? (matchingTermsCount / statementTerms.length) * 100
    : 0;
  
  // Contextual analysis
  articles.forEach(article => {
    const extractLower = article.extract.toLowerCase();
    
    // Check for contradictions (simple approach)
    if (
      (statementLower.includes('is') && extractLower.includes('is not')) ||
      (statementLower.includes('are') && extractLower.includes('are not')) ||
      (statementLower.includes('was') && extractLower.includes('was not')) ||
      (statementLower.includes('were') && extractLower.includes('were not')) ||
      (statementLower.includes('will') && extractLower.includes('will not')) ||
      (statementLower.includes('has') && extractLower.includes('has not')) ||
      (statementLower.includes('have') && extractLower.includes('have not')) ||
      (statementLower.includes('can') && extractLower.includes('cannot'))
    ) {
      containsContradiction = true;
    }
    
    // Check for support (simple approach)
    if (termMatchPercentage > 70) {
      containsSupport = true;
    }
    
    // Check for contextual match
    if (extractLower.includes(statementLower) || 
        statementLower.includes(extractLower.substring(0, 50))) {
      contextualMatch = true;
    }
  });
  
  // Determine truth score based on our analysis
  let score = 5; // Default neutral score
  let explanation = '';
  let detailedAnalysis = '';
  
  if (containsContradiction && !containsSupport) {
    score = 2;
    explanation = "Information found in reliable sources contradicts this statement.";
  } else if (containsSupport && !containsContradiction) {
    score = 8;
    explanation = "Information found in reliable sources supports this statement.";
  } else if (contextualMatch) {
    score = 7;
    explanation = "This statement appears to be contextually accurate based on reliable sources.";
  } else if (termMatchPercentage > 50) {
    score = 6;
    explanation = "Some elements of this statement appear to be accurate, but more information is needed for full verification.";
  } else if (termMatchPercentage > 30) {
    score = 5;
    explanation = "We found some related information, but cannot determine the accuracy of this statement.";
  } else {
    score = 4;
    explanation = "We found limited information related to this statement. Its accuracy cannot be determined.";
  }
  
  // Generate detailed analysis
  detailedAnalysis = `
Statement analysis based on Wikipedia sources:

Term match percentage: ${termMatchPercentage.toFixed(1)}%
Number of sources examined: ${articles.length}
${containsSupport ? "✓ Found supporting information" : "✗ No strong supporting information found"}
${containsContradiction ? "✓ Found potentially contradicting information" : "✗ No direct contradictions found"}
${contextualMatch ? "✓ Found contextual match" : "✗ No direct contextual match"}

This analysis is based on current Wikipedia content, which is generally reliable but can change over time. For definitive fact-checking, consider consulting specialized fact-checking organizations.
  `.trim();
  
  return {
    score,
    explanation,
    detailedAnalysis
  };
}