import { QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { router } from './router/index.tsx'
import { isGoogleSignInEnabled } from './components/auth/GoogleAuthButton'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ''

const App = () => {
  const content = (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )

  if (isGoogleSignInEnabled() && googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
  }

  return content
}

export default App
