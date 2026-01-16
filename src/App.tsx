import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PropertyDetails from "./pages/PropertyDetails";
import Bookings from "./pages/Bookings";
import HostDashboard from "./pages/HostDashboard";
import NewProperty from "./pages/NewProperty";
import Profile from "./pages/Profile";
import Wishlists from "./pages/Wishlists";
import MapView from "./pages/MapView";
import Inbox from "./pages/Inbox";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/host" element={<HostDashboard />} />
            <Route path="/host/properties/new" element={<NewProperty />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlists" element={<Wishlists />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
