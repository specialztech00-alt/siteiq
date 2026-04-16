import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import NewAnalysisPage from './pages/NewAnalysisPage.jsx'
import ArchivePage from './pages/ArchivePage.jsx'
import WeatherPage from './pages/WeatherPage.jsx'
import GeoPage from './pages/GeoPage.jsx'
import AssistantPage from './pages/AssistantPage.jsx'
import RiskRegisterPage from './pages/RiskRegisterPage.jsx'
import SafetyPage from './pages/SafetyPage.jsx'
import ContractPage from './pages/ContractPage.jsx'
import RegionalPage from './pages/RegionalPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import HelpPage from './pages/HelpPage.jsx'
import FloatingChat from './components/FloatingChat.jsx'
import AuthGuard from './components/AuthGuard.jsx'
import AppShell from './components/AppShell.jsx'

// Wraps every authenticated /app route with auth + shell
const AppLayout = ({ children }) => (
  <AuthGuard>
    <AppShell>{children}</AppShell>
    <FloatingChat />
  </AuthGuard>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ───────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* ── /app root → dashboard ───────────────────── */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />

        {/* ── Workspace ───────────────────────────────── */}
        <Route path="/app/dashboard" element={
          <AppLayout><DashboardPage /></AppLayout>
        }/>
        <Route path="/app/new-analysis" element={
          <AppLayout><NewAnalysisPage /></AppLayout>
        }/>
        <Route path="/app/archive" element={
          <AppLayout><ArchivePage /></AppLayout>
        }/>
        <Route path="/app/report" element={
          <AppLayout><ReportPage /></AppLayout>
        }/>

        {/* ── Intelligence ─────────────────────────────── */}
        <Route path="/app/safety" element={
          <AppLayout><SafetyPage /></AppLayout>
        }/>
        <Route path="/app/contract" element={
          <AppLayout><ContractPage /></AppLayout>
        }/>
        <Route path="/app/assistant" element={
          <AppLayout><AssistantPage /></AppLayout>
        }/>
        <Route path="/app/risks" element={
          <AppLayout><RiskRegisterPage /></AppLayout>
        }/>

        {/* ── Location ─────────────────────────────────── */}
        <Route path="/app/weather" element={
          <AppLayout><WeatherPage /></AppLayout>
        }/>
        <Route path="/app/geo" element={
          <AppLayout><GeoPage /></AppLayout>
        }/>
        <Route path="/app/regional" element={
          <AppLayout><RegionalPage /></AppLayout>
        }/>

        {/* ── Account ──────────────────────────────────── */}
        <Route path="/app/profile" element={
          <AppLayout><ProfilePage /></AppLayout>
        }/>
        <Route path="/app/settings" element={
          <AppLayout><SettingsPage /></AppLayout>
        }/>
        <Route path="/app/help" element={
          <AppLayout><HelpPage /></AppLayout>
        }/>

        {/* ── Catch-all ────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
