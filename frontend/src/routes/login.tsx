import { createFileRoute, redirect } from '@tanstack/react-router'
import LoginPage from '../pages/Login'

export const Route = createFileRoute('/login')({
  beforeLoad: ({context}) => {
    if(context.auth.isAuthenticated){
      throw redirect({
        to: '/', 
        search: {
          q: '',
          page: 1
        }
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <LoginPage/>
}
