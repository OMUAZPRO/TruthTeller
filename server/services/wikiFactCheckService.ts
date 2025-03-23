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
    
    // Get content extracts for the top articles (increased to 10)
    const articles = await Promise.all(
      searchResults.slice(0, 10).map(result => getWikipediaExtract(result.pageid))
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
    srlimit: '20', // Increased limit to get more results
    sroffset: '0',
    format: 'json',
    origin: '*'
  });
  
  const response = await fetch(`${endpoint}?${params}`);
  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.status}`);
  }
  
  const data = await response.json();

  // Also search for contradictory information by adding "not" to the search term
  const contradictorySearchTerm = `not ${searchTerm}`;
  const contradictoryParams = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: contradictorySearchTerm,
    srlimit: '10',
    format: 'json',
    origin: '*'
  });

  try {
    const contradictoryResponse = await fetch(`${endpoint}?${contradictoryParams}`);
    if (contradictoryResponse.ok) {
      const contradictoryData = await contradictoryResponse.json();
      // Combine both result sets, removing duplicates by pageid
      const allResults = [...data.query.search];
      const existingPageIds = new Set(allResults.map((result: WikiSearchResult) => result.pageid));
      
      contradictoryData.query.search.forEach((result: WikiSearchResult) => {
        if (!existingPageIds.has(result.pageid)) {
          allResults.push(result);
          existingPageIds.add(result.pageid);
        }
      });
      
      return allResults;
    }
  } catch (error) {
    console.error("Error fetching contradictory data:", error);
    // Continue with original results if contradictory search fails
  }

  return data.query.search;
}

/**
 * Get a detailed extract from a Wikipedia article
 */
async function getWikipediaExtract(pageId: number): Promise<{pageid: number; title: string; extract: string}> {
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
 * Advanced analysis of a statement against Wikipedia articles
 */
function analyzeStatement(statement: string, articles: Array<{title: string, extract: string}>) {
  const statementLower = statement.toLowerCase();
  let containsContradiction = false;
  let containsSupport = false;
  let contextualMatch = false;
  
  // Collect individual facts from articles
  const facts: { text: string, isContradiction: boolean, source: string }[] = [];
  
  // Parse statement into key components
  const statementWords = statementLower.split(' ');
  const statementNegated = statementLower.includes(' not ') || 
                           statementLower.includes("n't") || 
                           statementLower.includes(' never ') ||
                           statementLower.includes(' false ');
  
  // Look for key terms in the extracts
  const statementTerms = getSearchTerm(statement).split(' ');
  const matchingTermsCount = statementTerms.filter(term => 
    articles.some(article => article.extract.toLowerCase().includes(term.toLowerCase()))
  ).length;
  
  // Calculate term match percentage
  const termMatchPercentage = statementTerms.length > 0 
    ? (matchingTermsCount / statementTerms.length) * 100
    : 0;
  
  // Contextual analysis with improved contradiction detection
  articles.forEach(article => {
    const extractLower = article.extract.toLowerCase();
    const sentences = extractLower.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Check each sentence for relevance to our topic
    sentences.forEach(sentence => {
      const trimmedSentence = sentence.trim();
      // Skip very short sentences
      if (trimmedSentence.length < 10) return;
      
      // Check if sentence is relevant to our search terms
      const isRelevant = statementTerms.some(term => 
        trimmedSentence.includes(term.toLowerCase())
      );
      
      if (isRelevant) {
        // Check if this sentence contradicts or supports our statement
        const sentenceNegated = trimmedSentence.includes(' not ') || 
                                trimmedSentence.includes("n't") || 
                                trimmedSentence.includes(' never ') ||
                                trimmedSentence.includes(' false ');
        
        // Different negation status might indicate contradiction
        const isPotentialContradiction = sentenceNegated !== statementNegated;
        
        facts.push({
          text: trimmedSentence,
          isContradiction: isPotentialContradiction,
          source: article.title
        });
        
        if (isPotentialContradiction) {
          containsContradiction = true;
        } else if (
          trimmedSentence.includes(statementLower) || 
          statementWords.every(word => trimmedSentence.includes(word))
        ) {
          containsSupport = true;
        }
      }
    });
    
    // Additional specific contradiction patterns
    if (
      (statementLower.includes(' is ') && extractLower.includes(statementLower.replace(' is ', ' is not '))) ||
      (statementLower.includes(' are ') && extractLower.includes(statementLower.replace(' are ', ' are not '))) ||
      (statementLower.includes(' was ') && extractLower.includes(statementLower.replace(' was ', ' was not '))) ||
      (statementLower.includes(' were ') && extractLower.includes(statementLower.replace(' were ', ' were not '))) ||
      (statementLower.includes(' will ') && extractLower.includes(statementLower.replace(' will ', ' will not '))) ||
      (statementLower.includes(' has ') && extractLower.includes(statementLower.replace(' has ', ' has not '))) ||
      (statementLower.includes(' have ') && extractLower.includes(statementLower.replace(' have ', ' have not '))) ||
      (statementLower.includes(' can ') && extractLower.includes(statementLower.replace(' can ', ' cannot ')))
    ) {
      containsContradiction = true;
    }
    
    // Check for direct support
    if (termMatchPercentage > 70 && extractLower.includes(statementLower)) {
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
  
  // Adjust score based on evidence found
  if (containsContradiction && !containsSupport) {
    score = 2;
    explanation = "Information found in reliable sources contradicts this statement.";
  } else if (containsSupport && !containsContradiction) {
    score = 8;
    explanation = "Information found in reliable sources supports this statement.";
  } else if (containsSupport && containsContradiction) {
    score = 5;
    explanation = "We found conflicting information - some sources support this statement while others contradict it.";
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
  
  // Generate detailed analysis with facts
  const relevantFacts = facts.slice(0, 10); // Limit to 10 most relevant facts
  
  detailedAnalysis = `
Statement analysis based on Wikipedia sources:

Term match percentage: ${termMatchPercentage.toFixed(1)}%
Number of sources examined: ${articles.length}
${containsSupport ? "✓ Found supporting information" : "✗ No strong supporting information found"}
${containsContradiction ? "✓ Found potentially contradicting information" : "✗ No direct contradictions found"}
${contextualMatch ? "✓ Found contextual match" : "✗ No direct contextual match"}

Relevant facts found (${relevantFacts.length}):
${relevantFacts.map((fact, i) => 
  `${i+1}. ${fact.isContradiction ? "⚠️ " : ""}${fact.text.charAt(0).toUpperCase() + fact.text.slice(1)} (Source: ${fact.source})`
).join('\n')}

This analysis is based on current Wikipedia content, which is generally reliable but can change over time. For definitive fact-checking, consider consulting specialized fact-checking organizations.
  `.trim();
  
  return {
    score,
    explanation,
    detailedAnalysis
  };
}