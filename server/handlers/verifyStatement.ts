import { Request, Response } from "express";
import { statementVerificationSchema, type StatementVerificationRequest } from "@shared/schema";
import { factCheckStatement } from "../services/perplexityService";
import { storage } from "../storage";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { VerificationResponse } from "@shared/types";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export const verifyStatementHandler = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validatedData = statementVerificationSchema.parse(req.body);
    const { text, context } = validatedData;
    
    // Call the fact-checking service
    const verificationResult = await factCheckStatement(text, context);
    
    // Store the verification result
    const newStatement = await storage.createStatement({
      text,
      context: context || null,
      explanation: verificationResult.explanation,
      detailed_analysis: verificationResult.detailedAnalysis || null,
      truth_score: verificationResult.truthScore
    });
    
    // Store the sources
    const storedSources = await Promise.all(
      verificationResult.sources.map(source => 
        storage.createSource({
          statement_id: newStatement.id,
          name: source.name,
          year: source.year || null,
          excerpt: source.excerpt,
          url: source.url || null
        })
      )
    );
    
    // Return the verification result
    res.status(200).json({
      ...verificationResult,
      id: newStatement.id // Include the ID for frontend reference
    });
  } catch (error) {
    console.error("Error verifying statement:", error);
    
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    });
  }
};

export const getStatementsHandler = async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q as string | undefined;
    
    let statements;
    if (searchQuery && searchQuery.trim().length > 0) {
      statements = await storage.searchVerifiedStatements(searchQuery);
    } else {
      statements = await storage.getAllVerifiedStatements();
    }
    
    // Transform to expected VerificationResponse format
    const formattedStatements = statements.map(statement => ({
      id: statement.id,
      statement: statement.text,
      truthScore: statement.truth_score,
      truthRating: statement.truth_score >= 9 ? "True" :
                  statement.truth_score >= 7 ? "Mostly True" :
                  statement.truth_score >= 5 ? "Partially True" :
                  statement.truth_score >= 3 ? "Mostly False" : "False",
      explanation: statement.explanation,
      detailedAnalysis: statement.detailed_analysis || undefined,
      sources: statement.sources.map(source => ({
        name: source.name,
        year: source.year || undefined,
        excerpt: source.excerpt,
        url: source.url || undefined
      })),
      verifiedAt: statement.verified_at.toISOString()
    }));
    
    res.status(200).json(formattedStatements);
  } catch (error) {
    console.error("Error getting statements:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    });
  }
};

export const getStatementHandler = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid statement ID" });
    }
    
    const statement = await storage.getVerifiedStatement(id);
    if (!statement) {
      return res.status(404).json({ message: "Statement not found" });
    }
    
    // Transform to expected VerificationResponse format
    const formattedStatement = {
      id: statement.id,
      statement: statement.text,
      truthScore: statement.truth_score,
      truthRating: statement.truth_score >= 9 ? "True" :
                  statement.truth_score >= 7 ? "Mostly True" :
                  statement.truth_score >= 5 ? "Partially True" :
                  statement.truth_score >= 3 ? "Mostly False" : "False",
      explanation: statement.explanation,
      detailedAnalysis: statement.detailed_analysis || undefined,
      sources: statement.sources.map(source => ({
        name: source.name,
        year: source.year || undefined,
        excerpt: source.excerpt,
        url: source.url || undefined
      })),
      verifiedAt: statement.verified_at.toISOString()
    };
    
    res.status(200).json(formattedStatement);
  } catch (error) {
    console.error("Error getting statement:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    });
  }
};
