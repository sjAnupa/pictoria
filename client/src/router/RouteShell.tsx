import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function RouteShell() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, search])

  return <Outlet />
}
