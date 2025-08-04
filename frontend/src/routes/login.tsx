import { createFileRoute, redirect } from '@tanstack/react-router'
import LoginPage from '../pages/Login'

type LoginSearch = {
  redirect: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: search.redirect as string || '/'
    }
  },
  beforeLoad: ({context, search}) => {
    if(context.auth.isAuthenticated){
      throw redirect({
        to: search.redirect || '/'})
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <LoginPage/>
}
