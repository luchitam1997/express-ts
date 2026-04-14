import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

export function AuthGuard() {
  const token = useAppSelector((state) => state.auth.token)
  const location = useLocation()

  if (!token) {
    return (
      <Navigate
        to='/login'
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
