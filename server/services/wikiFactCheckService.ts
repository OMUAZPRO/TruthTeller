import { SourceInfo, VerificationResponse } from "@shared/types";
import { getTruthRating } from "@shared/types";

/**
 * Fact check a statement using Wikipedia content as a source
 * Enhanced to better handle news claims with improved preprocessing and analysis
 * This is a completely free approach that doesn't require API keys
 */
export async function factCheckStatement(statement: string, context?: string): Promise<VerificationResponse> {
  try {
    // Preprocess statement to handle common typos and formatting issues
    let processedStatement = preprocessStatement(statement);
    
    // Log the original and processed statement for debugging
    console.log("Original statement:", statement);
    console.log("Processed statement:", processedStatement);
    
    // Extract key terms from the statement with our enhanced algorithm
    const searchTerm = getSearchTerm(processedStatement);
    console.log("Generated search term:", searchTerm);
    
    // Search Wikipedia with our multi-query strategy for better coverage
    const searchResults = await searchWikipedia(searchTerm);
    
    if (!searchResults.length) {
      return {
        statement: processedStatement, // Use the corrected statement
        truthScore: 5,
        truthRating: getTruthRating(5),
        explanation: "We couldn't find reliable information to verify this news claim. Consider adding more specific details or checking specialized news sources.",
        sources: [],
        verifiedAt: new Date().toISOString()
      };
    }
    
    console.log(`Found ${searchResults.length} potential sources for verification`);
    
    // Get content extracts for the top articles (increased to 20 for better coverage)
    const articles = await Promise.all(
      searchResults.slice(0, 20).map(result => getWikipediaExtract(result.pageid))
    );
    
    // Filter out articles with very short extracts that likely won't be helpful
    const filteredArticles = articles.filter(article => article.extract.length > 50);
    
    // Create sources from the articles with improved excerpts that highlight relevant parts
    const sources: SourceInfo[] = filteredArticles.map(article => {
      // Try to find the most relevant section of the extract
      const excerpt = findRelevantExcerpt(article.extract, processedStatement, searchTerm);
      
      return {
        name: article.title,
        // Use current year since Wikipedia articles are constantly updated
        year: new Date().getFullYear().toString(),
        excerpt: excerpt,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replace(/ /g, '_'))}`
      };
    });
    
    // Analyze the statement against the articles with our improved analysis
    const analysis = analyzeStatement(processedStatement, filteredArticles);
    
    // Log analysis results for debugging
    console.log(`Analysis complete: Truth score ${analysis.score}/10, ${analysis.explanation}`);
    
    return {
      statement: processedStatement, // Use the corrected statement
      truthScore: analysis.score,
      truthRating: getTruthRating(analysis.score),
      explanation: analysis.explanation,
      detailedAnalysis: analysis.detailedAnalysis,
      sources,
      verifiedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in fact checking statement:", error);
    
    // Return a more helpful error response
    return {
      statement,
      truthScore: 5,
      truthRating: getTruthRating(5),
      explanation: "We encountered an issue while verifying this news claim. This might be due to network issues or the complexity of the statement. Try rephrasing or providing more context.",
      sources: [],
      verifiedAt: new Date().toISOString()
    };
  }
}

/**
 * Preprocess a statement to fix common typos, normalize spacing, and improve recognition
 */
function preprocessStatement(statement: string): string {
  // Fix common typos and spelling mistakes in news statements
  let processed = statement
    // Fix common typos
    .replace(/\b(\w+)wih(\b)/gi, '$1with$2')  // Fix "wih" typo
    .replace(/\b(\w+)teh(\b)/gi, '$1the$2')   // Fix "teh" typo
    .replace(/\bthier\b/gi, 'their')          // Fix "thier" typo
    .replace(/\brecieved\b/gi, 'received')    // Fix "recieved" typo
    .replace(/\bgovt\b/gi, 'government')      // Expand common abbreviations
    .replace(/\bpres\b/gi, 'president')
    .replace(/\b(\w+)didnt\b/gi, '$1 didn\'t')  // Fix missing spaces and apostrophes
    .replace(/\b(\w+)wont\b/gi, '$1 won\'t')
    .replace(/\b(\w+)cant\b/gi, '$1 can\'t')
    // Fix mixed case issues that might be common in news headlines
    .replace(/\b([A-Z]{2,})\b/g, (match) => match.charAt(0) + match.slice(1).toLowerCase()); // Convert "NATO" to "Nato" etc.
  
  // Normalize whitespace
  processed = processed
    .replace(/\s+/g, ' ')
    .trim();
  
  // Ensure proper capitalization at the beginning of the statement
  if (processed.length > 0) {
    processed = processed.charAt(0).toUpperCase() + processed.slice(1);
  }
  
  // If statement ends without punctuation, add a period for proper sentence structure
  if (!/[.!?]$/.test(processed)) {
    processed += '.';
  }
  
  return processed;
}

/**
 * Find the most relevant section of an article extract based on the statement
 */
function findRelevantExcerpt(extract: string, statement: string, searchTerm: string): string {
  // Split extract into sentences
  const sentences = extract.split(/(?<=[.!?])\s+/);
  
  // If the extract is short, just return it with ellipsis
  if (extract.length < 200) {
    return extract;
  }
  
  // Get keywords from both the statement and search term
  const statementKeywords = statement.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const searchKeywords = searchTerm.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  // Use object to deduplicate
  const uniqueKeywordsObj: {[key: string]: boolean} = {};
  [...statementKeywords, ...searchKeywords].forEach(word => {
    uniqueKeywordsObj[word] = true;
  });
  const allKeywords = Object.keys(uniqueKeywordsObj);
  
  // Score each sentence based on keyword matches
  const scoredSentences = sentences.map(sentence => {
    const sentenceLower = sentence.toLowerCase();
    let score = 0;
    
    // Check for keyword matches
    allKeywords.forEach(keyword => {
      if (sentenceLower.includes(keyword)) {
        score += 1;
      }
    });
    
    // Bonus points for sentences containing named entities from the statement
    const namedEntities = statement.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    namedEntities.forEach(entity => {
      if (sentenceLower.includes(entity.toLowerCase())) {
        score += 2;
      }
    });
    
    return { sentence, score };
  });
  
  // Sort sentences by score (highest first)
  scoredSentences.sort((a, b) => b.score - a.score);
  
  // Get top 2-3 most relevant sentences
  const relevantSentences = scoredSentences.slice(0, 3)
    .filter(item => item.score > 0) // Only include sentences with some relevance
    .map(item => item.sentence);
  
  // If we couldn't find any relevant sentences, return the beginning of the extract
  if (relevantSentences.length === 0) {
    return extract.substring(0, 200) + "...";
  }
  
  // Join the relevant sentences and truncate if needed
  let excerpt = relevantSentences.join(' ');
  if (excerpt.length > 300) {
    excerpt = excerpt.substring(0, 300) + "...";
  } else if (excerpt.length < extract.length) {
    excerpt += "...";
  }
  
  return excerpt;
}

/**
 * Extract a search term from a statement, optimized for news headlines
 * Enhanced to better understand user intent and keyword importance
 */
function getSearchTerm(statement: string): string {
  // Pre-process the statement to fix common typos and misspellings
  let processedStatement = statement
    .replace(/\b(\w+)wih(\b)/gi, '$1with$2')  // Fix common "wih" typo
    .replace(/\b(\w+)teh(\b)/gi, '$1the$2')   // Fix common "teh" typo
    .replace(/\bthier\b/gi, 'their')          // Fix common "thier" typo
    .replace(/\bdidnt\b/gi, "didn't")         // Fix missing apostrophes
    .replace(/\bwont\b/gi, "won't")
    .replace(/\bcant\b/gi, "can't")
    .replace(/\bhasnt\b/gi, "hasn't");

  // Find entities (names, organizations, locations) which are often capitalized in news headlines
  // Extended to capture multi-word entities with more complex patterns
  const potentialEntities = processedStatement.match(/\b[A-Z][a-z]+(?:\s+(?:[A-Z][a-z]+|\b(?:of|the|and|in|on|at)\b))*\b/g) || [];
  
  // Extract locations, which are especially important in news
  const locationPattern = /\b(?:America|Russia|China|Europe|Israel|Palestine|Gaza|Ukraine|Africa|Asia|Australia|Canada|Mexico|Brazil|India|Japan|Korea|France|Germany|Italy|Spain|UK|United Kingdom|United States|USA|US|EU|Middle East|North|South|East|West)\b/gi;
  const locations = processedStatement.match(locationPattern) || [];
  
  // Extract organization names, which are critical in news
  const orgPattern = /\b(?:UN|NATO|WHO|FBI|CIA|NSA|Google|Microsoft|Apple|Amazon|Tesla|Facebook|Twitter|Hamas|Congress|Senate|House|Pentagon|White House|Government|Police|Military|Army|Navy|Air Force|Republicans|Democrats|GOP)\b/gi;
  const organizations = processedStatement.match(orgPattern) || [];
  
  // Remove common words and keep important ones, particularly nouns and verbs common in news
  // Expanded stopwords list to better isolate key concepts
  const stopwords = [
    'the', 'and', 'that', 'this', 'with', 'from', 'will', 'have', 'has', 'had', 
    'would', 'could', 'should', 'says', 'said', 'claims', 'reported', 'for', 'are', 'is',
    'was', 'were', 'been', 'being', 'they', 'them', 'their', 'there', 'here', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'some',
    'such', 'than', 'too', 'very', 'can', 'cant', 'cannot', 'not', 'only', 'own'
  ];
  
  const words = processedStatement.toLowerCase()
    .replace(/[^\w\s-]/gi, '') // Keep hyphens as they're often meaningful in compound terms
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !stopwords.includes(word)
    );
  
  // Prioritize words that appear to be news keywords
  const newsKeywords = [
    'war', 'peace', 'attack', 'killed', 'died', 'crisis', 'election', 'vote', 'pandemic',
    'vaccine', 'conflict', 'protest', 'economy', 'inflation', 'climate', 'disaster',
    'shooting', 'legislation', 'bill', 'law', 'court', 'ruling', 'decision', 'agreement',
    'deal', 'treaty', 'scandal', 'investigation', 'announced', 'launched', 'accused',
    'charged', 'arrested', 'convicted', 'sentenced', 'released', 'banned', 'approved',
    'rejected', 'resigned', 'fired', 'appointed', 'elected', 'defeated', 'won', 'lost'
  ];
  
  const prioritizedWords = words.sort((a, b) => {
    const aIsKeyword = newsKeywords.includes(a);
    const bIsKeyword = newsKeywords.includes(b);
    
    if (aIsKeyword && !bIsKeyword) return -1;
    if (!aIsKeyword && bIsKeyword) return 1;
    return 0;
  });
  
  // Extract dates which are common in news articles - expanded pattern
  const datePatterns = [
    // MM/DD/YYYY
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
    // YYYY
    /\b(?:19[0-9]{2}|20[0-9]{2})\b/,
    // Month name, day, year
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b/i,
    // Relative time references
    /\b(?:yesterday|today|last week|last month|last year|this week|this month|this year)\b/i
  ];
  
  const dates = datePatterns.flatMap(pattern => processedStatement.match(pattern) || []);
  
  // Extract numbers which are meaningful in news (percentages, statistics, counts)
  const numbers = processedStatement.match(/\b\d+(?:\.\d+)?(?:\s+(?:percent|million|billion|trillion|people|deaths|cases))?\b/gi) || [];
  
  // Combine all extracted elements, prioritizing entities, locations, and organizations
  const searchTerms = [
    ...potentialEntities.slice(0, 3).map(term => term.toLowerCase()),
    ...locations.slice(0, 2).map(loc => loc.toLowerCase()),
    ...organizations.slice(0, 2).map(org => org.toLowerCase()),
    ...prioritizedWords.slice(0, 6),
    ...dates.slice(0, 1),
    ...numbers.slice(0, 2)
  ];
  
  // Remove duplicates with improved handling
  const uniqueTermsObj: {[key: string]: boolean} = {};
  searchTerms.forEach(term => {
    // Skip empty strings and very short terms
    if (term && term.length > 1) {
      // Normalize to lower case and trim whitespace
      const normalizedTerm = term.toLowerCase().trim();
      uniqueTermsObj[normalizedTerm] = true;
    }
  });
  const uniqueTerms = Object.keys(uniqueTermsObj);
  
  // If we still have a large number of terms, prioritize based on probable importance
  let finalTerms = uniqueTerms;
  if (uniqueTerms.length > 8) {
    // For very long queries, create a scoring system to select the most important terms
    const termScores: {[key: string]: number} = {};
    
    uniqueTerms.forEach(term => {
      let score = 0;
      // Capitalized terms from the original statement get higher scores
      if (potentialEntities.some(entity => entity.toLowerCase() === term)) score += 3;
      // Location and organization terms get high scores
      if (locations.some(loc => loc.toLowerCase() === term)) score += 3;
      if (organizations.some(org => org.toLowerCase() === term)) score += 3;
      // News keywords get medium scores
      if (newsKeywords.includes(term)) score += 2;
      // Numbers and dates get medium scores
      if (numbers.some(num => num.toLowerCase() === term)) score += 2;
      if (dates.some(date => date.toLowerCase() === term)) score += 2;
      // All other terms get a base score of 1
      score += 1;
      
      termScores[term] = score;
    });
    
    // Sort terms by score in descending order
    finalTerms = uniqueTerms.sort((a, b) => termScores[b] - termScores[a]);
  }
  
  // Return the most relevant search terms (up to 8)
  return finalTerms.slice(0, 8).join(' ');
}

// Interface for Wikipedia search result
interface WikiSearchResult {
  pageid: number;
  title: string;
  snippet: string;
}

/**
 * Search Wikipedia for articles related to the search term
 * Enhanced with multi-query strategy for better news claim analysis
 */
async function searchWikipedia(searchTerm: string): Promise<WikiSearchResult[]> {
  const endpoint = 'https://en.wikipedia.org/w/api.php';
  
  // Create multiple search approaches for thorough coverage
  const searchQueries = generateSearchQueries(searchTerm);
  
  // Execute primary search
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: searchTerm,
    srlimit: '30', // Increased limit to get more results
    sroffset: '0',
    format: 'json',
    origin: '*'
  });
  
  const response = await fetch(`${endpoint}?${params}`);
  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Use an object to track unique results by pageid
  const existingPageIds: {[key: number]: boolean} = {};
  const allResults = [...data.query.search];
  allResults.forEach((result: WikiSearchResult) => {
    existingPageIds[result.pageid] = true;
  });

  // Execute additional searches in parallel with alternative search strategies
  try {
    const additionalSearches = await Promise.allSettled(
      searchQueries.map(async (query) => {
        const queryParams = new URLSearchParams({
          action: 'query',
          list: 'search',
          srsearch: query,
          srlimit: '15', // Increased for more results
          format: 'json',
          origin: '*'
        });
        
        const res = await fetch(`${endpoint}?${queryParams}`);
        if (res.ok) {
          return await res.json();
        }
        return null;
      })
    );
    
    // Process the results from all searches
    additionalSearches.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        const searchData = result.value;
        if (searchData.query && searchData.query.search) {
          // Add unique results to our collection
          searchData.query.search.forEach((item: WikiSearchResult) => {
            if (!existingPageIds[item.pageid]) {
              allResults.push(item);
              existingPageIds[item.pageid] = true;
            }
          });
        }
      }
    });
  } catch (error) {
    console.error("Error in additional searches:", error);
    // Continue with what we have if any of the additional searches fail
  }

  return allResults;
}

/**
 * Generate multiple search query variations to improve search coverage
 * Especially important for news claims which may have different phrasings
 */
function generateSearchQueries(searchTerm: string): string[] {
  const queries: string[] = [];
  
  // Add various negation searches to find contradictory information
  queries.push(`not ${searchTerm}`);
  queries.push(`debunked ${searchTerm}`);
  queries.push(`false claim ${searchTerm}`);
  queries.push(`incorrect ${searchTerm}`);

  // Pull out likely entities and create focused queries
  const entities = searchTerm.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  
  // Extract additional keywords for better search coverage
  const keywords = searchTerm.toLowerCase().split(' ')
    .filter(word => word.length > 3)
    .filter(word => !['and', 'that', 'this', 'with', 'from', 'will', 'have', 'has', 'had'].includes(word));
  
  // Include the top keywords for more targeted searches
  if (keywords.length > 2) {
    const topKeywords = keywords.slice(0, Math.min(5, keywords.length));
    queries.push(topKeywords.join(' '));
  }
  
  if (entities.length > 0) {
    // Create combinations of the most important entities (up to 4 for better coverage)
    const topEntities = entities.slice(0, 4);
    topEntities.forEach(entity => {
      queries.push(entity);
      
      // Add contextual searches for each entity
      if (keywords.length > 0) {
        const contextKeyword = keywords[0];
        queries.push(`${entity} ${contextKeyword}`);
      }
    });
    
    // If we have multiple entities, combine them in pairs
    if (topEntities.length >= 2) {
      for (let i = 0; i < topEntities.length - 1; i++) {
        for (let j = i + 1; j < topEntities.length; j++) {
          queries.push(`${topEntities[i]} ${topEntities[j]}`);
        }
      }
    }
  }
  
  // Extract locations for location-specific searches
  const locationPatterns = [
    /\b(?:America|Russia|China|Europe|Israel|Palestine|Gaza|Ukraine|Africa|Asia|Australia|Canada|Mexico|Brazil|India|Japan|Korea|France|Germany|Italy|Spain|UK|United Kingdom|United States|USA|US|EU|Middle East|North|South|East|West)\b/gi
  ];
  
  const locations = locationPatterns.flatMap(pattern => searchTerm.match(pattern) || []);
  if (locations.length > 0) {
    // Add location-specific queries
    locations.forEach(location => {
      // If location is part of the original search term, use it with additional context
      if (queries.findIndex(q => q === location) === -1) {
        queries.push(location);
      }
      
      // For news, locations often appear with words like "conflict", "war", etc.
      const newsKeywords = ['war', 'conflict', 'crisis', 'attack', 'elections', 'government'];
      newsKeywords.forEach(keyword => {
        if (searchTerm.toLowerCase().includes(keyword)) {
          queries.push(`${location} ${keyword}`);
        }
      });
    });
  }
  
  // Extract years and dates for time-specific searches
  const years = searchTerm.match(/\b(?:19|20)\d{2}\b/g) || [];
  if (years.length > 0) {
    years.forEach(year => {
      // Add the year with the first entity for better context
      if (entities.length > 0) {
        queries.push(`${entities[0]} ${year}`);
      }
      
      // If we identified locations, add year+location queries
      if (locations.length > 0) {
        queries.push(`${locations[0]} ${year}`);
      }
    });
  }
  
  // Add news-specific fact-checking search patterns
  const newsFactChecking = ['fact check', 'debunked', 'misinformation', 'disinformation'];
  if (searchTerm.split(' ').length > 3) {
    // Only add fact-checking terms for longer statements that might be claims
    newsFactChecking.forEach(term => {
      queries.push(`${term} ${searchTerm.split(' ').slice(0, 4).join(' ')}`);
    });
  }
  
  // Filter out duplicates and very short queries using an object
  const uniqueQueriesObj: {[key: string]: boolean} = {};
  queries.forEach(query => {
    // Normalize and clean up the query
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length > 3 && normalizedQuery !== searchTerm.toLowerCase()) {
      uniqueQueriesObj[normalizedQuery] = true;
    }
  });
  
  // Return unique queries, limited to prevent too many API calls
  return Object.keys(uniqueQueriesObj).slice(0, 8); // Increased from 5 to 8 for better coverage
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