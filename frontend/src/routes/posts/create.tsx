import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/create')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname + location.search,
        },
      })
    }
    if(!context.auth.user?.isAdmin){
        throw redirect({
            to: '/forbidden'
        })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/posts/create"!</div>
}
