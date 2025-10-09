import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FormulaEditorTest from "./components/FormulaEditorTest";
import SimpleTest from "./components/SimpleTest";
import RankDemo from "./components/RankDemo";
import RankTestPage from "./components/RankTestPage";
import FormulaEditorScrollTest from "./components/FormulaEditorTest";
import { FormulaFieldTest } from "./components/FormulaFieldTest";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/simple-test" element={<SimpleTest />} />
            <Route path="/formula-test" element={<FormulaEditorTest />} />
            <Route path="/rank-demo" element={<RankDemo />} />
            <Route path="/rank-test" element={<RankTestPage />} />
            <Route path="/formula-editor-test" element={<FormulaEditorScrollTest />} />
            <Route path="/formula-field-test" element={<FormulaFieldTest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
