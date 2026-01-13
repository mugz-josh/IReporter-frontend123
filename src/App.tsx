import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import "./i18n";

import Homepage from "./pages/Homepage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateReport from "./pages/CreateReport";
import RedFlags from "./pages/RedFlags";
import Interventions from "./pages/Interventions";
import AdminDashboard from "./pages/AdminDashboard";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import NotificationsPage from "./pages/Notifications";

const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/red-flags" element={<RedFlags />} />
              <Route path="/interventions" element={<Interventions />} />
              <Route path="/create" element={<CreateReport />} />
              <Route path="/support" element={<Support />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/comments" element={<AdminDashboard />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
export default App;
