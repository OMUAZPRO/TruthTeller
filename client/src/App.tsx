import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FloatingElements } from "@/components/ui/floating-elements";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useState, useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [theme, setTheme] = useState<'calm' | 'fun'>('calm');
  const [mounted, setMounted] = useState(false);

  // Initialize mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Toggle theme function that could be exposed via context if needed
  const toggleTheme = () => {
    setTheme(prev => prev === 'calm' ? 'fun' : 'calm');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ease-in-out ${
      theme === 'calm' 
        ? 'bg-gradient-to-b from-blue-50 to-white' 
        : 'bg-gradient-to-b from-indigo-50 via-blue-50 to-white'
    }`}>
      <div className="relative overflow-hidden">
        {/* Large background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-32 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Interactive floating elements */}
        {mounted && (
          <FloatingElements 
            type={theme === 'calm' ? 'bubbles' : 'shapes'} 
            density="medium"
            speed={theme === 'calm' ? 'slow' : 'medium'}
            color="mixed"
            interactive={true}
          />
        )}
        
        <QueryClientProvider client={queryClient}>
          <div className="relative z-10">
            <Router />
            
            {/* Theme toggle (could be positioned elsewhere via context) */}
            <button 
              onClick={toggleTheme}
              className="fixed bottom-4 right-4 z-50 rounded-full p-2 bg-white/80 shadow-md hover:bg-white transition-colors"
              aria-label={`Switch to ${theme === 'calm' ? 'fun' : 'calm'} mode`}
              title={`Switch to ${theme === 'calm' ? 'fun' : 'calm'} mode`}
            >
              {theme === 'calm' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"></path>
                  <path d="M12 8v2"></path>
                  <path d="M12 14v2"></path>
                  <path d="M8 12h2"></path>
                  <path d="M14 12h2"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9 10h.01"></path>
                  <path d="M15 10h.01"></path>
                  <path d="M9.5 15a3.5 3.5 0 0 0 5 0"></path>
                </svg>
              )}
            </button>
          </div>
          <Toaster />
        </QueryClientProvider>
      </div>
    </div>
  );
}

export default App;
