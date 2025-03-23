import { SourceInfo, VerificationResponse } from "@shared/types";
import { getTruthRating } from "@shared/types";

// Interface for Google Fact Check API response
interface GoogleFactCheckResponse {
  claims: Array<{
    text: string;
    claimant?: string;
    claimDate?: string;
    claimReview: Array<{
      publisher: {
        name: string;
        site?: string;
      };
      url: string;
      title?: string;
      reviewDate?: string;
      textualRating?: string;
      languageCode?: string;
      reviewRating?: {
        ratingValue?: number;
        bestRating?: number;
        worstRating?: number;
      };
    }>;
  }>;
  nextPageToken?: string;
}

/**
 * Convert Google Fact Check rating to our 0-10 scale
 */
function mapRatingToScore(textualRating: string): number {
  // Normalize the rating text
  const lowerRating = textualRating.toLowerCase();
  
  // Map common fact-check ratings to our scale
  if (lowerRating.includes("true") && !lowerRating.includes("mostly") && !lowerRating.includes("partly")) {
    return 10;
  } else if (lowerRating.includes("mostly true") || lowerRating.includes("accurate") || lowerRating.includes("correct")) {
    return 8;
  } else if (lowerRating.includes("partly true") || lowerRating.includes("mixture") || lowerRating.includes("mixed")) {
    return 5;
  } else if (lowerRating.includes("mostly false")) {
    return 3;
  } else if (lowerRating.includes("false") || lowerRating.includes("fake") || lowerRating.includes("hoax") || lowerRating.includes("pants on fire")) {
    return 1;
  } else if (lowerRating.includes("misleading")) {
    return 4;
  } else if (lowerRating.includes("unproven") || lowerRating.includes("unverified")) {
    return 5;
  } else {
    // Default score for unknown ratings
    return 5;
  }
}

/**
 * Fact check a statement using Google's Fact Check Tools API
 */
export async function factCheckStatement(statement: string, context?: string): Promise<VerificationResponse> {
  try {
    // Encode the query for URL
    const query = encodeURIComponent(statement);
    
    // Call the Google Fact Check Tools API (free, no API key required)
    const response = await fetch(`https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${query}&languageCode=en-US`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Fact Check API error: ${response.status} ${errorText}`);
    }
    
    const data: GoogleFactCheckResponse = await response.json();
    
    // If no claims found, return a default response
    if (!data.claims || data.claims.length === 0) {
      return {
        statement,
        truthScore: 5,
        truthRating: getTruthRating(5),
        explanation: "No fact checks found for this statement. We cannot verify its accuracy without more information.",
        sources: [],
        verifiedAt: new Date().toISOString()
      };
    }
    
    // Find the most relevant claim
    const relevantClaim = data.claims[0]; // Use the first claim
    
    // Create sources from claim reviews
    const sources: SourceInfo[] = relevantClaim.claimReview.map((review, index) => ({
      name: review.publisher.name || `Fact Checker ${index + 1}`,
      year: review.reviewDate ? new Date(review.reviewDate).getFullYear().toString() : new Date().getFullYear().toString(),
      excerpt: review.title || "Fact check available at this source.",
      url: review.url || ""
    }));
    
    // Calculate an average truth score from all reviews
    let totalScore = 0;
    relevantClaim.claimReview.forEach(review => {
      if (review.textualRating) {
        totalScore += mapRatingToScore(review.textualRating);
      } else if (review.reviewRating?.ratingValue !== undefined) {
        // Normalize rating to our 0-10 scale if available
        const bestRating = review.reviewRating.bestRating || 5;
        const worstRating = review.reviewRating.worstRating || 1;
        const range = bestRating - worstRating;
        // Convert to our 0-10 scale, ensuring the direction is correct
        const normalizedScore = range !== 0 
          ? ((review.reviewRating.ratingValue - worstRating) / range) * 10
          : 5;
        totalScore += normalizedScore;
      } else {
        // Default score if no rating provided
        totalScore += 5;
      }
    });
    
    const averageScore = Math.round(totalScore / relevantClaim.claimReview.length);
    
    // Build explanation from claim reviews
    let explanation = `Based on ${relevantClaim.claimReview.length} fact checks, this statement has been rated ${getTruthRating(averageScore)}.`;
    
    // Build detailed analysis from claim reviews
    const reviewDetails = relevantClaim.claimReview.map(review => 
      `${review.publisher.name} rated this claim as "${review.textualRating || "Unrated"}" ${review.reviewDate ? `on ${new Date(review.reviewDate).toLocaleDateString()}` : ""}.`
    ).join("\n\n");
    
    const detailedAnalysis = `
Multiple fact-checking organizations have reviewed this claim:

${reviewDetails}

${relevantClaim.claimant ? `The claim was originally made by ${relevantClaim.claimant}.` : ""}
${relevantClaim.claimDate ? `The claim was made on ${new Date(relevantClaim.claimDate).toLocaleDateString()}.` : ""}

See the sources below for more detailed information about this fact check.
`.trim();
    
    return {
      statement,
      truthScore: averageScore,
      truthRating: getTruthRating(averageScore),
      explanation,
      detailedAnalysis,
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