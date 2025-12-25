import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useServerStore } from "@/stores/serverStore";
import ConnectScreen from "@/components/ConnectScreen";
import DashboardLayout from "@/components/DashboardLayout";
import ConsolePage from "@/pages/ConsolePage";
import PlayersPage from "@/pages/PlayersPage";
import AddonsPage from "@/pages/AddonsPage";
import PropertiesPage from "@/pages/PropertiesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isConnected } = useServerStore();

  if (!isConnected) {
    return <ConnectScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<ConsolePage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/addons" element={<AddonsPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
