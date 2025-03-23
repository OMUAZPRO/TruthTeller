import { Statement, Source } from "./schema";

// Extended statement with sources
export interface VerifiedStatement extends Statement {
  sources: Source[];
}

// Response from fact-checking API
export interface VerificationResponse {
  statement: string;
  truthScore: number; // 0-10 scale
  truthRating: string; // "True", "Mostly True", "Partially True", "Mostly False", "False"
  explanation: string;
  detailedAnalysis?: string;
  sources: SourceInfo[];
  verifiedAt: string;
}

export interface SourceInfo {
  name: string;
  year?: string;
  excerpt: string;
  url?: string;
}

// Truth rating levels
export const TRUTH_RATINGS = {
  TRUE: "True",
  MOSTLY_TRUE: "Mostly True",
  PARTIALLY_TRUE: "Partially True",
  MOSTLY_FALSE: "Mostly False",
  FALSE: "False"
};

// Get truth rating based on score
export function getTruthRating(score: number): string {
  if (score >= 9) return TRUTH_RATINGS.TRUE;
  if (score >= 7) return TRUTH_RATINGS.MOSTLY_TRUE;
  if (score >= 5) return TRUTH_RATINGS.PARTIALLY_TRUE;
  if (score >= 3) return TRUTH_RATINGS.MOSTLY_FALSE;
  return TRUTH_RATINGS.FALSE;
}

// Get color class based on truth rating
export function getTruthRatingColorClass(rating: string): string {
  switch (rating) {
    case TRUTH_RATINGS.TRUE:
      return "bg-secondary"; // green
    case TRUTH_RATINGS.MOSTLY_TRUE:
      return "bg-green-500";
    case TRUTH_RATINGS.PARTIALLY_TRUE:
      return "bg-pending"; // yellow
    case TRUTH_RATINGS.MOSTLY_FALSE:
      return "bg-orange-500";
    case TRUTH_RATINGS.FALSE:
      return "bg-accent"; // red
    default:
      return "bg-gray-500";
  }
}

export function getTruthMeterWidthClass(score: number): string {
  const percentage = (score / 10) * 100;
  if (percentage <= 10) return "w-[10%]"; // Minimum width for visibility
  if (percentage <= 20) return "w-[20%]";
  if (percentage <= 30) return "w-[30%]";
  if (percentage <= 40) return "w-[40%]";
  if (percentage <= 50) return "w-[50%]";
  if (percentage <= 60) return "w-[60%]";
  if (percentage <= 70) return "w-[70%]";
  if (percentage <= 80) return "w-[80%]";
  if (percentage <= 90) return "w-[90%]";
  return "w-full";
}

export function getTruthMeterColor(score: number): string {
  if (score >= 8) return "bg-secondary"; // green
  if (score >= 6) return "bg-green-500"; 
  if (score >= 4) return "bg-pending"; // yellow
  if (score >= 2) return "bg-orange-500";
  return "bg-accent"; // red
}
