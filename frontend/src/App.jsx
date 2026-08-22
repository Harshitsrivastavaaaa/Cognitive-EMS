import { Routes, Route, Navigate, HashRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import MainLayout from './components/layout/MainLayout'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import EmployeesListPage from './pages/EmployeesListPage'
import EmployeeProfilePage from './pages/EmployeeProfilePage'
import ProjectsPage from './pages/ProjectsPage'
import Settings from './pages/Settings'
import AttendancePage from './pages/AttendancePage'
import SalaryPage from './pages/SalaryPage'
import AboutPage from './components/layout/AboutPage'
import Contact from './pages/Contact'
import ProductPage from './pages/ProductPage'
import CareersPage from './pages/CareersPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import SecurityPage from './pages/SecurityPage'
import DocsPage from './pages/DocsPage'
import ScrollToTop from './components/layout/ScrollToTop'
import OnboardingPage from './pages/OnboardingPage'
import OffboardingPage from './pages/OffboardingPage'
import DocumentsPage from './pages/DocumentsPage';
import EmployeePortalLayout from './components/layout/EmployeePortalLayout'
import EmployeePortalDashboard from './pages/employee-portal/EmployeePortalDashboard'
import EmployeeMyProfile from './pages/employee-portal/EmployeeMyProfile'
import EmployeeAttendancePage from './pages/employee-portal/EmployeeAttendancePage'
import EmployeeProjectsPage from './pages/employee-portal/EmployeeProjectsPage'
import EmployeeLeavePage from './pages/employee-portal/EmployeeLeavePage'
import EmployeeMyDocumentsPage from './pages/employee-portal/EmployeeMyDocumentsPage'
import LeaveManagementPage from './pages/LeaveManagementPage'

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role || 'employer')) {
        return <Navigate to={role === 'employee' ? '/employee-portal' : '/dashboard'} replace />;
    }
    return children;
};

function AppRoutes() {
    return (
        <div className="app-container min-h-screen bg-slate-50 text-slate-900 font-sans">
            <ScrollToTop />
            <Routes>
                {/* Public Marketing Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/aboutpage" element={<AboutPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/product" element={<ProductPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/docs" element={<DocsPage />} />
                
                {/* Authentication */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Administrative (Employer) Routes */}
                <Route element={<ProtectedRoute allowedRoles={['employer']}><MainLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/employees" element={<EmployeesListPage />} />
                    <Route path="/employees/:id" element={<EmployeeProfilePage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/salary" element={<SalaryPage />} />
                    <Route path="/leave-management" element={<LeaveManagementPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/offboarding" element={<OffboardingPage />} />
                </Route>

                {/* Protected Employee Portal Routes */}
                <Route element={<ProtectedRoute allowedRoles={['employee']}><EmployeePortalLayout /></ProtectedRoute>}>
                    <Route path="/employee-portal" element={<EmployeePortalDashboard />} />
                    <Route path="/employee-portal/profile" element={<EmployeeMyProfile />} />
                    <Route path="/employee-portal/documents" element={<EmployeeMyDocumentsPage />} />
                    <Route path="/employee-portal/attendance" element={<EmployeeAttendancePage />} />
                    <Route path="/employee-portal/projects" element={<EmployeeProjectsPage />} />
                    <Route path="/employee-portal/leave" element={<EmployeeLeavePage />} />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <HashRouter>
            <AuthProvider>
                <AppProvider>
                    <AppRoutes />
                </AppProvider>
            </AuthProvider>
        </HashRouter>
    )
}

export default App;

/* ENDS HERE */
/* Checked - HARSHIT SRIVASTAVA */