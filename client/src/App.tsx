import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { TaskDialog } from "@/components/TaskDialog";
import { useState } from "react";
import NotFound from "@/pages/not-found";

// Pages
import Overview from "@/pages/Overview";
import BoardView from "@/pages/BoardView";
import ListView from "@/pages/ListView";
import Users from "@/pages/Users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/board" component={BoardView} />
      <Route path="/list" component={ListView} />
      <Route path="/users" component={Users} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [location] = useLocation();

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/": return "Overview";
      case "/board": return "Kanban Board";
      case "/list": return "All Tasks";
      case "/users": return "Team Management";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex">
      <Sidebar onNewTask={() => setIsDialogOpen(true)} />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-8 flex items-center justify-between animate-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{getPageTitle(location)}</h1>
            <p className="text-muted-foreground mt-1">Manage your team's work efficiently.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                  U{i}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-background bg-slate-100 flex items-center justify-center text-xs font-medium text-muted-foreground">
                +2
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>

      <TaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
