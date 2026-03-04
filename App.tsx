import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth } from "./pages/Auth";
import { WorkspaceSelection } from "./pages/WorkspaceSelection";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    const savedWorkspace = localStorage.getItem('selectedWorkspace');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedWorkspace && savedUser) {
      setSelectedWorkspace(JSON.parse(savedWorkspace));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('selectedWorkspace');
    setUser(null);
    setSelectedWorkspace(null);
  };

  const handleSelectWorkspace = (workspace: any) => {
    setSelectedWorkspace(workspace);
    localStorage.setItem('selectedWorkspace', JSON.stringify(workspace));
  };

  const handleLeaveWorkspace = () => {
    localStorage.removeItem('selectedWorkspace');
    setSelectedWorkspace(null);
  };

  // If not logged in, show auth page
  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Auth onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // If logged in but no workspace selected, show workspace selection
  if (!selectedWorkspace) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <WorkspaceSelection 
            user={user} 
            onSelectWorkspace={handleSelectWorkspace}
            onLogout={handleLogout}
          />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // If both user and workspace are selected, show main app
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <Index 
                  user={user} 
                  workspace={selectedWorkspace} 
                  onLogout={handleLogout}
                  onLeaveWorkspace={handleLeaveWorkspace}
                />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
