import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Pages - Code Split using React.lazy
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const StaffManagement = lazy(() => import('./pages/staff/StaffManagement'));
const Inventory = lazy(() => import('./pages/inventory/Inventory'));
const Donors = lazy(() => import('./pages/donors/Donors'));
const Appointments = lazy(() => import('./pages/appointments/Appointments'));
const Requests = lazy(() => import('./pages/requests/Requests'));
const FindBlood = lazy(() => import('./pages/search/FindBlood'));
const CollectionDashboard = lazy(() => import('./pages/collection/CollectionDashboard'));
const Camps = lazy(() => import('./pages/camps/Camps'));

// Lab Routes
const LabDashboard = lazy(() => import('./pages/lab/LabDashboard'));
const LabQueue = lazy(() => import('./pages/lab/LabQueue'));
const LabScan = lazy(() => import('./pages/lab/LabScan'));
const LabUnitTesting = lazy(() => import('./pages/lab/LabUnitTesting'));
const LabReportReview = lazy(() => import('./pages/lab/LabReportReview'));
const LabHistory = lazy(() => import('./pages/lab/LabHistory'));
const LabExceptions = lazy(() => import('./pages/lab/LabExceptions'));

// Donor specific pages
const BookDonation = lazy(() => import('./pages/donor/BookDonation'));
const DonorAppointments = lazy(() => import('./pages/donor/Appointments'));
const DonorHistory = lazy(() => import('./pages/donor/History'));
const DonorMilestones = lazy(() => import('./pages/donor/Milestones'));
const DonorProfile = lazy(() => import('./pages/donor/Profile'));

// Common routes
const Support = lazy(() => import('./pages/support/Support'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/search" element={<FindBlood />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/requests" element={<Requests />} />
                  <Route path="/donors" element={<Donors />} />
                  <Route path="/camps" element={<Camps />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/collection" element={<CollectionDashboard />} />
                  <Route path="/staff" element={<StaffManagement />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/reports" element={<Reports />} />
                  
                  {/* Donor Specific Routes */}
                  <Route path="/donor/book" element={<BookDonation />} />
                  <Route path="/donor/appointments" element={<DonorAppointments />} />
                  <Route path="/donor/history" element={<DonorHistory />} />
                  <Route path="/donor/milestones" element={<DonorMilestones />} />
                  <Route path="/donor/profile" element={<DonorProfile />} />
                  
                  {/* Lab Specific Routes */}
                  <Route path="/lab/dashboard" element={<LabDashboard />} />
                  <Route path="/lab/queue" element={<LabQueue />} />
                  <Route path="/lab/scan" element={<LabScan />} />
                  <Route path="/lab/unit/:id/testing" element={<LabUnitTesting />} />
                  <Route path="/lab/unit/:id/review" element={<LabReportReview />} />
                  <Route path="/lab/history" element={<LabHistory />} />
                  <Route path="/lab/exceptions" element={<LabExceptions />} />
                  
                  {/* Other protected routes */}
                  <Route path="/support" element={<Support />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
