import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages will be imported here
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ChangePassword from './pages/auth/ChangePassword';
import Settings from './pages/settings/Settings';
import Reports from './pages/reports/Reports';
import StaffManagement from './pages/staff/StaffManagement';
import Inventory from './pages/inventory/Inventory';
import Donors from './pages/donors/Donors';
import Appointments from './pages/appointments/Appointments';
import Requests from './pages/requests/Requests';
import FindBlood from './pages/search/FindBlood';
import CollectionDashboard from './pages/collection/CollectionDashboard';
import Camps from './pages/camps/Camps';

// Lab Routes
import LabDashboard from './pages/lab/LabDashboard';
import LabQueue from './pages/lab/LabQueue';
import LabScan from './pages/lab/LabScan';
import LabUnitTesting from './pages/lab/LabUnitTesting';
import LabReportReview from './pages/lab/LabReportReview';
import LabHistory from './pages/lab/LabHistory';
import LabExceptions from './pages/lab/LabExceptions';

// Donor specific pages
import BookDonation from './pages/donor/BookDonation';
import DonorAppointments from './pages/donor/Appointments';
import DonorHistory from './pages/donor/History';
import DonorMilestones from './pages/donor/Milestones';
import DonorProfile from './pages/donor/Profile';

// Common routes
import Support from './pages/support/Support';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
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
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
