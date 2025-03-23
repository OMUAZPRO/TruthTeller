import { useState } from "react";
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

const StatementForm = ({ onVerificationComplete }: StatementFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    },
    onError: (error) => {
      toast({
        title: "Error",
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
    mutation.mutate(values);
  };

  return (
    <section className="relative card rounded-xl p-8 mb-8 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <div className="relative">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            News Verification
          </h2>
          <div className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span className="inline-block h-1 w-1 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-sm text-blue-500 font-medium">100% Free</span>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Enter a news headline or claim to verify:</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., 'Study finds social media usage linked to depression in teens' or 'New climate policy expected to reduce emissions by 30% by 2030'"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white bg-opacity-80 shadow-sm transition-all focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Additional context (optional):</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any context that might help with verification (e.g., time period, location, etc.)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white bg-opacity-80 shadow-sm transition-all focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2.5 px-8 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </div> : 
                  "Verify News"
                }
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default StatementForm;
