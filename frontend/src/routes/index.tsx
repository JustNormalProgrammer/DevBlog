import { createFileRoute } from '@tanstack/react-router'
import Main from '@/pages/Main'

type PostSearch = {
  q: string,
  page: number,
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): PostSearch => {
    return {
      q: (search.q as string) || '',
      page: Number(search.page ?? 1),
    }
  },
  component: App,
})

function App() {
  return (
    <Main/>
  )
}
