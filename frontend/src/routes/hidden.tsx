import { Checkbox, Grid, Input, Stack, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import {
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useDebouncedCallback } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import InternalServerError from '@/components/primitives/InternalServerError'
import { useAuth } from '@/contexts/authProvider'
import BottomNav from '@/components/MainPage/MainBottomNav'
import PostList from '@/components/PostList'

type PostSearch = {
  q: string
  page: number
}

export const Route = createFileRoute('/hidden')({
  validateSearch: (search: Record<string, unknown>): PostSearch => {
    return {
      q: (search.q as string) || '',
      page: Number(search.page ?? 1),
    }
  },
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname + location.search,
        },
      })
    }
    if (!context.auth.user?.isAdmin) {
      throw redirect({
        to: '/forbidden',
      })
    }
  },
  component: RouteComponent,
})

export default function RouteComponent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { q, page } = Route.useSearch()
  const api = useAxiosPrivate()
  const handleSearch = useDebouncedCallback((term: string) => {
    navigate({ to: '/', search: { q: term, page: 1 }, replace: true })
  }, 300)
  const {
    isPending,
    isError,
    error,
    data: posts,
  } = useQuery({
    queryKey: ['posts', 'hidden', page, q],
    queryFn: async () => {
      const response = await api.get(`/posts/hidden?query=${q}&page=${page}`)
      return [...response.data]
    },
    staleTime: 60 * 1000,
  })
  const { data: pages } = useQuery({
    queryKey: ['posts', 'hidden', 'pages', q],
    queryFn: async () => {
      const response = await api.get(`/posts/pages/hidden?query=${q}`)
      console.log(response)
      return response.data
    },
    staleTime: 60 * 1000,
  })

  // It's displaying error without search
  if (isError) {
    if (!axios.isAxiosError(error)) {
      return <InternalServerError />
    }
    if (error.response?.status === 401) {
      navigate({
        to: '/login',
        search: { redirect: location.pathname + location.search },
      })
      return
    }
    if (error.response?.status === 403) {
      navigate({
        to: '/forbidden',
      })
    }
  }
  return (
    <Grid
      container
      flexGrow={1}
      direction={'column'}
      marginBottom={'50px'}
      width={'100%'}
      maxWidth={{ xs: '500px', md: '100%' }}
    >
      <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={2} sx={{ padding: 2, width: '100%' }}>
          <Input
            fullWidth
            id="input-with-icon-adornment"
            placeholder="Search..."
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            defaultValue={q}
            onChange={(e) => {
              handleSearch(e.currentTarget.value)
            }}
          />
          {user?.isAdmin && (
            <Stack
              direction={'row'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <Typography variant="subtitle1" color="textDisabled">
                Show only unpublished posts
              </Typography>
              <Checkbox
                defaultChecked={true}
                onChange={() =>
                  navigate({ to: '/', search: { q: q, page: 1 } })
                }
              />
            </Stack>
          )}
        </Paper>
      </Grid>
      <Grid
        flexGrow={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <PostList
          q={q}
          page={page}
          isPending={isPending}
          posts={posts}
          isShowingHiddenPosts={true}
        />
      </Grid>
      <BottomNav q={q} page={page} isShowingHiddenPosts={true} pages={pages} />
    </Grid>
  )
}
