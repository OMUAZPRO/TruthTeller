import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { VerificationResponse } from "@shared/types";
import { FunLoader } from "@/components/ui/fun-loader";

// Form schema with validation
const formSchema = z.object({
  text: z.string().min(5, {
    message: "Statement must be at least 5 characters long.",
  }),
  context: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StatementFormProps {
  onVerificationComplete: (data: VerificationResponse & { id: number }) => void;
}

// Example news headlines for placeholder suggestions
const EXAMPLE_HEADLINES = [
  "NASA discovers evidence of water on Mars",
  "New study shows coffee may reduce risk of heart disease",
  "SpaceX launches 60 new satellites into orbit",
  "WHO announces new guidelines for pandemic response",
  "Scientists develop new renewable energy breakthrough"
];

const StatementForm = ({ onVerificationComplete }: StatementFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [showTip, setShowTip] = useState(false);

  // Rotate through example headlines for the placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % EXAMPLE_HEADLINES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show a tip after form interaction
  useEffect(() => {
    const tipTimer = setTimeout(() => {
      setShowTip(true);
    }, 3000);
    return () => clearTimeout(tipTimer);
  }, []);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      context: "",
    },
  });

  // Mutation for submitting statement
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/verify", values);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/statements"] });
      onVerificationComplete(data);
      form.reset();
      // Show success toast with a fun message
      toast({
        title: "Analysis Complete! 🔍",
        description: "We've analyzed your statement using our trusty Wikipedia data.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Oops! Something went wrong",
        description: error instanceof Error ? error.message : "Failed to verify statement. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    setShowTip(false);
    mutation.mutate(values);
  };

  // Custom placeholders with rotating examples
  const placeholderText = `E.g., "${EXAMPLE_HEADLINES[currentPlaceholder]}"`;

  return (
    <section className="relative card rounded-xl p-8 mb-8 overflow-hidden animate-breath">
      {/* Decorative background elements */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <div className="relative">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between mb-6">
          <h2 className="text-2xl font-bold fun-text animate-gentle-pulse">
            News Verification
          </h2>
          <div className="mt-2 sm:mt-0 flex items-center">
            <span className="fun-badge animate-float">
              100% Free Verification
            </span>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>Enter a news headline or claim to verify:</span>
                    <span className="text-blue-500 animate-pulse">✓</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={placeholderText}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white bg-opacity-90 shadow-sm transition-all focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 hover:shadow-md"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {showTip && !field.value && (
                    <p className="text-xs text-blue-500 mt-1 animate-fadeIn">
                      💡 Tip: Try entering a specific news headline or claim for the best results!
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                    <span>Additional context (optional):</span>
                    <span className="ml-1 text-xs text-blue-400">(helps improve accuracy)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any context that might help with verification (e.g., time period, location, sources)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white bg-opacity-90 shadow-sm transition-all focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 hover:shadow-md"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col items-center pt-4">
              <Button
                type="submit"
                className="fun-button group relative px-10 py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-3">
                    <FunLoader 
                      type="bounce" 
                      size="small" 
                      text="" 
                      colorClass="text-white" 
                    />
                    <span>Analyzing News...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Verify News</span>
                    <span className="absolute inset-0 translate-y-1.5 translate-x-1.5 bg-blue-600 rounded-md opacity-30 transition-transform group-hover:translate-y-0 group-hover:translate-x-0"></span>
                  </>
                )}
              </Button>
              
              {!isSubmitting && (
                <div className="mt-3 text-xs text-gray-500 animate-fadeIn opacity-80">
                  Powered by Wikipedia - 100% free, no API key needed
                </div>
              )}
              
              {isSubmitting && (
                <div className="mt-4 text-sm text-blue-500 animate-fadeIn opacity-90 max-w-md text-center">
                  <p>We're analyzing this news claim using multiple sources...</p>
                  <div className="w-full bg-blue-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="animate-shimmer bg-blue-500 h-full"></div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default StatementForm;
