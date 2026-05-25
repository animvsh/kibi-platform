
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseGenerationProvider } from "@/contexts/CourseGenerationContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import Index from "./pages/Index";
import OutlineBuilder from "./pages/OutlineBuilder";
import ModuleGenerator from "./pages/ModuleGenerator";
import CourseReview from "./pages/CourseReview";
import CourseDashboard from "./pages/CourseDashboard";
import Course from "./pages/Course";
import Auth from "./pages/Auth";
import CourseGenerationStatusModal from "./components/course-generation/CourseGenerationStatusModal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DemoModeProvider>
          <CourseGenerationProvider>
            <Toaster />
            <BrowserRouter>
              <CourseGenerationStatusModal />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/outline-builder" element={<OutlineBuilder />} />
                <Route path="/module-generator" element={<ModuleGenerator />} />
                <Route path="/course-review" element={<CourseReview />} />
                <Route path="/course-dashboard" element={<CourseDashboard />} />
                <Route path="/course-dashboard/:courseId" element={<CourseDashboard />} />
                <Route path="/course/:id" element={<Course />} />
                <Route path="/auth" element={<Auth />} />
              </Routes>
            </BrowserRouter>
          </CourseGenerationProvider>
        </DemoModeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
