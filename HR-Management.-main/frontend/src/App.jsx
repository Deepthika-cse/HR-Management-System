import { Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/auth.jsx'
import HomePage from './pages/home.jsx'
import ProjectsPage from './pages/projects.jsx'
import TeamPage from './pages/team.jsx'
import SettingsPage from './pages/settings.jsx'
import ProfilePage from './pages/profile.jsx'
import EmployeesPage from './pages/employees.jsx'
import EmployeeFormPage from './pages/employee-form.jsx'
import EmployeeExitPage from './pages/employee-exit.jsx'
import EmployeeDetailsPage from './pages/employee-details.jsx'
import EmployeeProfilePage from './pages/EmployeeProfile.jsx'
import OnboardingChecklist from './pages/OnboardingChecklist.jsx'
import OnboardingHRView from './pages/OnboardingHRView.jsx'
import ComplianceDashboard from './pages/ComplianceDashboard.jsx'
import AlertDashboard from './pages/AlertDashboard';
import RequireAuth from './auth/RequireAuth.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/home"
        element={
          <HomePage />
        }
      />
      <Route
        path="/employees"
        element={
          <EmployeesPage />
        }
      />
      <Route
        path="/employees/new"
        element={
          <EmployeeFormPage />
        }
      />
      <Route
        path="/employees/:empId"
        element={
          <EmployeeDetailsPage />
        }
      />
      <Route
        path="/employees/:empId/profile"
        element={
          <EmployeeProfilePage />
        }
      />
      <Route
        path="/employees/:empId/edit"
        element={
          <EmployeeFormPage />
        }
      />
      <Route
        path="/employees/:empId/exit"
        element={
          <EmployeeExitPage />
        }
      />
      <Route
        path="/employees/:empId/onboarding"
        element={
          <OnboardingChecklist />
        }
      />
      <Route
        path="/onboarding-monitor"
        element={
          <OnboardingHRView />
        }
      />
      <Route
        path="/compliance-dashboard"
        element={
          <ComplianceDashboard />
        }
      />
      <Route
        path="/alerts"
        element={
          <AlertDashboard />
        }
      />
      <Route
        path="/projects"
        element={
          <ProjectsPage />
        }
      />
      <Route
        path="/team"
        element={
          <TeamPage />
        }
      />
      <Route
        path="/settings"
        element={
          <SettingsPage />
        }
      />
      <Route
        path="/profile"
        element={
          <ProfilePage />
        }
      />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
