import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore.js'

/**
 * Wraps protected routes. Redirects to /signin if not authenticated,
 * passing the original path so we can redirect back after login.
 */
export default function AuthGuard({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return children
}
