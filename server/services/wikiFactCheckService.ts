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
 * Extract a search term from a statement, optimized for news headlines
 */
function getSearchTerm(statement: string): string {
  // Find entities (names, organizations, locations) which are often capitalized in news headlines
  const potentialEntities = statement.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  
  // Remove common words and keep important ones, particularly nouns and verbs common in news
  const words = statement.toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .filter(word => 
      word.length > 2 && 
      !['the', 'and', 'that', 'this', 'with', 'from', 'will', 'have', 'has', 'had', 
        'would', 'could', 'should', 'says', 'said', 'claims', 'reported'].includes(word)
    );
  
  // Extract dates which are common in news articles
  const dates = statement.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}\b|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b/gi) || [];
  
  // Combine entities, important words, and dates, prioritizing entities
  const searchTerms = [
    ...potentialEntities.slice(0, 3).map(term => term.toLowerCase()),
    ...words.slice(0, 6),
    ...dates.slice(0, 1)
  ];
  
  // Remove duplicates using an object approach instead of Set
  const uniqueTermsObj: {[key: string]: boolean} = {};
  searchTerms.forEach(term => {
    uniqueTermsObj[term] = true;
  });
  const uniqueTerms = Object.keys(uniqueTermsObj);
  
  // Return the most relevant search terms (up to 7)
  return uniqueTerms.slice(0, 7).join(' ');
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
      // Use an object instead of Set for compatibility
      const existingPageIds: {[key: number]: boolean} = {};
      allResults.forEach((result: WikiSearchResult) => {
        existingPageIds[result.pageid] = true;
      });
      
      contradictoryData.query.search.forEach((result: WikiSearchResult) => {
        if (!existingPageIds[result.pageid]) {
          allResults.push(result);
          existingPageIds[result.pageid] = true;
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
 * Advanced analysis of a statement against Wikipedia articles, optimized for news headlines
 */
function analyzeStatement(statement: string, articles: Array<{title: string, extract: string}>) {
  const statementLower = statement.toLowerCase();
  let containsContradiction = false;
  let containsSupport = false;
  let contextualMatch = false;
  let recencyMatch = false;
  let isPotentialSensationalism = false;
  
  // Collect individual facts from articles
  const facts: { text: string, isContradiction: boolean, source: string }[] = [];
  
  // Parse statement into key components
  const statementWords = statementLower.split(' ');
  const statementNegated = statementLower.includes(' not ') || 
                           statementLower.includes("n't") || 
                           statementLower.includes(' never ') ||
                           statementLower.includes(' false ');
  
  // Detect news-specific language patterns
  const containsBoldClaims = /\b(?:breaking|exclusive|shocking|unprecedented|all|every|always|never|most|best|worst|first|only)\b/i.test(statement);
  const containsEmotionalWords = /\b(?:devastating|remarkable|amazing|incredible|terrible|horrific|catastrophic|miracle|disaster|tragic|outrage)\b/i.test(statement);
  const containsRecencyMarkers = /\b(?:just|recent|recently|latest|new|today|yesterday|this week|this month|this year|breaking)\b/i.test(statement);
  const containsHedging = /\b(?:may|might|could|reportedly|allegedly|according to|claims|suggests|possibly|potentially)\b/i.test(statement);
  
  // News headlines often contain sensationalistic language
  isPotentialSensationalism = containsBoldClaims || containsEmotionalWords;
  
  // Look for key terms in the extracts
  const statementTerms = getSearchTerm(statement).split(' ');
  const matchingTermsCount = statementTerms.filter(term => 
    articles.some(article => article.extract.toLowerCase().includes(term.toLowerCase()))
  ).length;
  
  // Calculate term match percentage
  const termMatchPercentage = statementTerms.length > 0 
    ? (matchingTermsCount / statementTerms.length) * 100
    : 0;
  
  // Extract named entities (potential key subjects in news)
  const namedEntities = statement.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const entitiesLower = namedEntities.map(entity => entity.toLowerCase());
  
  // Extract numbers which are common in news claims
  const numbers = statement.match(/\b\d+(?:\.\d+)?(?:\s+(?:percent|million|billion|trillion))?\b/gi) || [];
  
  // Contextual analysis with improved contradiction detection for news
  articles.forEach(article => {
    const extractLower = article.extract.toLowerCase();
    const sentences = extractLower.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Check if named entities are mentioned in this article
    const entityMatches = entitiesLower.filter(entity => extractLower.includes(entity));
    const hasEntityMatch = entityMatches.length > 0;
    
    // Check if numbers/stats are mentioned
    const numberMatches = numbers.filter(num => extractLower.includes(num.toLowerCase()));
    const hasNumberMatch = numberMatches.length > 0;
    
    // Check each sentence for relevance to our topic
    sentences.forEach(sentence => {
      const trimmedSentence = sentence.trim();
      // Skip very short sentences
      if (trimmedSentence.length < 10) return;
      
      // Check if sentence is relevant to our search terms
      const termRelevant = statementTerms.some(term => 
        trimmedSentence.includes(term.toLowerCase())
      );
      
      // Check if sentence mentions any of our named entities
      const entityRelevant = entitiesLower.some(entity => 
        trimmedSentence.includes(entity)
      );
      
      // Check if sentence mentions any numbers from the statement
      const numberRelevant = numbers.some(num => 
        trimmedSentence.includes(num.toLowerCase())
      );
      
      // Combined relevance score - prioritize entity matches for news headlines
      const isRelevant = termRelevant || entityRelevant || numberRelevant;
      
      if (isRelevant) {
        // Check if this sentence contradicts or supports our statement
        const sentenceNegated = trimmedSentence.includes(' not ') || 
                                trimmedSentence.includes("n't") || 
                                trimmedSentence.includes(' never ') ||
                                trimmedSentence.includes(' false ') ||
                                trimmedSentence.includes(' incorrect ') ||
                                trimmedSentence.includes(' inaccurate ');
        
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
          // If most words appear in the same sentence, it's likely supporting
          statementWords.filter(word => word.length > 3).every(word => trimmedSentence.includes(word))
        ) {
          containsSupport = true;
        }
        
        // Check for recency markers that align with the statement's recency claims
        if (containsRecencyMarkers && 
            /\b(?:recent|recently|latest|new|current|today|yesterday|this week|this month|this year)\b/i.test(trimmedSentence)) {
          recencyMatch = true;
        }
      }
    });
    
    // Additional news-specific contradiction patterns
    if (
      // Look for opposite assertions using news reporting verbs
      (statementLower.includes(' claims ') && extractLower.includes(statementLower.replace(' claims ', ' denies '))) ||
      (statementLower.includes(' says ') && extractLower.includes(statementLower.replace(' says ', ' denies '))) ||
      (statementLower.includes(' reports ') && extractLower.includes(statementLower.replace(' reports ', ' denies '))) ||
      (statementLower.includes(' states ') && extractLower.includes(statementLower.replace(' states ', ' denies '))) ||
      (statementLower.includes(' announced ') && extractLower.includes(statementLower.replace(' announced ', ' denied '))) ||
      (statementLower.includes(' shows ') && extractLower.includes(statementLower.replace(' shows ', ' doesn\'t show '))) ||
      
      // Standard contractions
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
    
    // Check for direct support with high confidence for news headlines
    if (
      (termMatchPercentage > 70 && extractLower.includes(statementLower)) ||
      // If the article contains all named entities and a similar structure
      (hasEntityMatch && hasNumberMatch && termMatchPercentage > 60)
    ) {
      containsSupport = true;
    }
    
    // Check for contextual match - more specific for news
    if (
      extractLower.includes(statementLower) || 
      // If most named entities and numbers match, it's likely contextually relevant
      (entityMatches.length >= Math.ceil(entitiesLower.length * 0.75) && 
       numberMatches.length >= Math.ceil(numbers.length * 0.75))
    ) {
      contextualMatch = true;
    }
  });
  
  // Determine truth score based on our analysis
  let score = 5; // Default neutral score
  let explanation = '';
  let detailedAnalysis = '';
  
  // Adjust score based on evidence found - modified for news context
  if (containsContradiction && !containsSupport) {
    score = 2;
    explanation = "Information found in reliable sources contradicts this news claim.";
  } else if (containsSupport && !containsContradiction) {
    score = 8;
    explanation = "Information found in reliable sources supports this news claim.";
    // Penalize sensationalism slightly
    if (isPotentialSensationalism) {
      score -= 1;
      explanation += " However, the claim contains potentially sensationalistic language.";
    }
  } else if (containsSupport && containsContradiction) {
    score = 5;
    explanation = "We found conflicting information - some sources support this news claim while others contradict it.";
  } else if (contextualMatch && recencyMatch) {
    score = 7;
    explanation = "This news claim appears to be contextually accurate based on reliable sources, including recent information.";
  } else if (contextualMatch) {
    score = 6;
    explanation = "This news claim appears to be contextually accurate based on reliable sources.";
  } else if (termMatchPercentage > 50) {
    score = 6;
    explanation = "Some elements of this news claim appear to be accurate, but more information is needed for full verification.";
  } else if (termMatchPercentage > 30) {
    score = 5;
    explanation = "We found some related information, but cannot fully verify this news claim.";
  } else {
    score = 4;
    explanation = "We found limited information related to this news claim. Its accuracy cannot be determined.";
  }
  
  // Handle hedged claims differently
  if (containsHedging && score < 7) {
    score += 1;
    explanation += " The claim contains qualifying language (like 'reportedly' or 'allegedly') which acknowledges uncertainty.";
  }
  
  // Generate detailed analysis with facts, enhanced for news
  const relevantFacts = facts.slice(0, 10); // Limit to 10 most relevant facts
  
  detailedAnalysis = `
News Verification Analysis:

Term match percentage: ${termMatchPercentage.toFixed(1)}%
Number of sources examined: ${articles.length}
${containsSupport ? "✓ Found supporting information" : "✗ No strong supporting information found"}
${containsContradiction ? "✓ Found potentially contradicting information" : "✗ No direct contradictions found"}
${contextualMatch ? "✓ Found contextual match in reliable sources" : "✗ No direct contextual match"}
${recencyMatch ? "✓ Found recent information that matches claim timing" : ""}
${isPotentialSensationalism ? "⚠️ Claim may contain sensationalistic language" : ""}
${containsHedging ? "ℹ️ Claim contains cautious/hedged language" : ""}

Key entities examined: ${namedEntities.join(', ') || "None identified"}
${numbers.length > 0 ? `Numerical claims: ${numbers.join(', ')}` : "No numerical claims identified"}

Relevant facts found (${relevantFacts.length}):
${relevantFacts.map((fact, i) => 
  `${i+1}. ${fact.isContradiction ? "⚠️ " : ""}${fact.text.charAt(0).toUpperCase() + fact.text.slice(1)} (Source: ${fact.source})`
).join('\n')}

This analysis is based on current Wikipedia content, which is generally reliable but can change over time. For definitive fact-checking of news, consider consulting multiple specialized fact-checking organizations.
  `.trim();
  
  return {
    score,
    explanation,
    detailedAnalysis
  };
}