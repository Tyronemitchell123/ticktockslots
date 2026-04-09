import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import PageLoader from "@/components/PageLoader";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";
import ProtectedRoute from "@/components/ProtectedRoute";

// Eagerly load landing page for best LCP
import Index from "./pages/Index";

// Lazy load all other pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const About = lazy(() => import("./pages/About"));
const Careers = lazy(() => import("./pages/Careers"));
const ESGReport = lazy(() => import("./pages/ESGReport"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const EmailDashboard = lazy(() => import("./pages/EmailDashboard"));
const Billing = lazy(() => import("./pages/Billing"));
const MerchantEarnings = lazy(() => import("./pages/MerchantEarnings"));
const MerchantRegister = lazy(() => import("./pages/MerchantRegister"));
const MerchantSlots = lazy(() => import("./pages/MerchantSlots"));
const ForBusiness = lazy(() => import("./pages/ForBusiness"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/esg" element={<ESGReport />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                <Route path="/admin/emails" element={<ProtectedRoute><EmailDashboard /></ProtectedRoute>} />
                <Route path="/merchant/earnings" element={<ProtectedRoute><MerchantEarnings /></ProtectedRoute>} />
                <Route path="/merchant/register" element={<ProtectedRoute><MerchantRegister /></ProtectedRoute>} />
                <Route path="/merchant/slots" element={<ProtectedRoute><MerchantSlots /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
