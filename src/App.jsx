import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import AuthGuard from './components/AuthGuard.jsx'
import AppShell from './components/AppShell.jsx'

// Wraps every authenticated /app route with auth + shell
const AppLayout = ({ children }) => (
  <AuthGuard>
    <AppShell>{children}</AppShell>
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
          <AppLayout><PlaceholderPage title="Dashboard" /></AppLayout>
        }/>
        <Route path="/app/new-analysis" element={
          <AppLayout><PlaceholderPage title="New Analysis" /></AppLayout>
        }/>
        <Route path="/app/archive" element={
          <AppLayout><PlaceholderPage title="Project Archive" /></AppLayout>
        }/>
        <Route path="/app/report" element={
          <AppLayout><ReportPage /></AppLayout>
        }/>

        {/* ── Intelligence ─────────────────────────────── */}
        <Route path="/app/safety" element={
          <AppLayout><PlaceholderPage title="Safety Monitor" /></AppLayout>
        }/>
        <Route path="/app/contract" element={
          <AppLayout><PlaceholderPage title="Contract Analyser" /></AppLayout>
        }/>
        <Route path="/app/assistant" element={
          <AppLayout><PlaceholderPage title="AI Assistant" /></AppLayout>
        }/>
        <Route path="/app/risks" element={
          <AppLayout><PlaceholderPage title="Risk Register" /></AppLayout>
        }/>

        {/* ── Location ─────────────────────────────────── */}
        <Route path="/app/weather" element={
          <AppLayout><PlaceholderPage title="Site Weather" /></AppLayout>
        }/>
        <Route path="/app/geo" element={
          <AppLayout><PlaceholderPage title="Geo Intelligence" /></AppLayout>
        }/>
        <Route path="/app/regional" element={
          <AppLayout><PlaceholderPage title="Regional Risks" /></AppLayout>
        }/>

        {/* ── Account ──────────────────────────────────── */}
        <Route path="/app/profile" element={
          <AppLayout><PlaceholderPage title="Profile" /></AppLayout>
        }/>
        <Route path="/app/settings" element={
          <AppLayout><PlaceholderPage title="Settings" /></AppLayout>
        }/>
        <Route path="/app/help" element={
          <AppLayout><PlaceholderPage title="Help & Docs" /></AppLayout>
        }/>

        {/* ── Catch-all ────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
