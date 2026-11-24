import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom'
import PageLoader from './components/common/PageLoader'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { BrandingProvider } from './context/BrandingContext'
import MainLayout from './components/layout/MainLayout'
import EmployeePortalLayout from './components/layout/EmployeePortalLayout'
import ScrollToTop from './components/layout/ScrollToTop'

// Pages are code-split so the first load only downloads the page being opened
const LoginPage = lazy(() => import('./pages/LoginPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const EmployeesListPage = lazy(() => import('./pages/EmployeesListPage'))
const EmployeeProfilePage = lazy(() => import('./pages/EmployeeProfilePage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const Settings = lazy(() => import('./pages/Settings'))
const AttendancePage = lazy(() => import('./pages/AttendancePage'))
const SalaryPage = lazy(() => import('./pages/SalaryPage'))
const AboutPage = lazy(() => import('./components/layout/AboutPage'))
const Contact = lazy(() => import('./pages/Contact'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CareersPage = lazy(() => import('./pages/CareersPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const SecurityPage = lazy(() => import('./pages/SecurityPage'))
const DocsPage = lazy(() => import('./pages/DocsPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const OffboardingPage = lazy(() => import('./pages/OffboardingPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const EmployeePortalDashboard = lazy(() => import('./pages/employee-portal/EmployeePortalDashboard'))
const EmployeeMyProfile = lazy(() => import('./pages/employee-portal/EmployeeMyProfile'))
const EmployeeAttendancePage = lazy(() => import('./pages/employee-portal/EmployeeAttendancePage'))
const EmployeeProjectsPage = lazy(() => import('./pages/employee-portal/EmployeeProjectsPage'))
const EmployeeLeavePage = lazy(() => import('./pages/employee-portal/EmployeeLeavePage'))
const EmployeeMyDocumentsPage = lazy(() => import('./pages/employee-portal/EmployeeMyDocumentsPage'))
const LeaveManagementPage = lazy(() => import('./pages/LeaveManagementPage'))
const Footer = lazy(() => import('../src/components/layout/Footer'))

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
            <Suspense fallback={<PageLoader fullScreen />}>
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
                <Route path="/footer" element={<Footer />} />
                
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
            </Suspense>
        </div>
    );
}

function App() {
    return (
        <HashRouter>
            <BrandingProvider>
                <AuthProvider>
                    <AppProvider>
                        <AppRoutes />
                    </AppProvider>
                </AuthProvider>
            </BrandingProvider>
        </HashRouter>
    )
}

export default App;

/* ENDS HERE */
/* Checked - HARSHIT SRIVASTAVA */