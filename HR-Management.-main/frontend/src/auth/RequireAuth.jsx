import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

function RequireAuth({ children }) {
  return children
}

export default RequireAuth
