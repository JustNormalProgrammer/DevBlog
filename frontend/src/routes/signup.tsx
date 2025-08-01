import { createFileRoute, redirect } from '@tanstack/react-router'
import SignupPage from '../pages/Signup'

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/',
        search: {
          q: '',
          page: 1,
        },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <SignupPage />
}
