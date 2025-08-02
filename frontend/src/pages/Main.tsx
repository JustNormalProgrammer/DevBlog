import { Grid, Input } from '@mui/material'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useDebouncedCallback } from 'use-debounce'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import api from '@/utils/axios'

const route = getRouteApi('/')

function PostList() {
  const { page, q } = route.useSearch()

  const { isPending, isError, error, data, isFetching, isPlaceholderData } =
    useQuery({
      queryKey: ['posts', page, q],
      queryFn: async () => {
        try {
          const response = await api.get(`/posts/?query=${q}`)
          return [...response.data]
        } catch (e) {
          throw new Error('Failed to connect to the server')
        }
      },
      placeholderData: keepPreviousData,
    })

  if (isError) return error.message
  return isPending ? (
    'Loading...'
  ) : (
    <Grid
      container
      spacing={1}
      my={3}
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '1200px',
        width: '100%'
      }}
    >
      {data.map((post, index) => (
        <Grid
          key={post.id}
          size={{ xs: 12, md: 6 }}
          maxWidth={'1000px'}
        >
          <Paper
            elevation={5}
            sx={{ height: '300px', minWidth: '200px' }}
          >
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            <p>{post.updatedAt}</p>
            <p>{post.username}</p>
            <p>{index}</p>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

export default function Main() {
  const navigate = useNavigate()
  const { q } = route.useSearch()
  const handleSearch = useDebouncedCallback((term: string) => {
    console.log('search', term)
    navigate({ to: '/', search: { q: term, page: 1 }, replace: true })
  }, 300)
  return (
    <Grid container flexGrow={1} direction={'column'} my={6}>
      <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={2}
          sx={{ padding: 2, maxWidth: '1000px', width: '100%' }}
        >
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
        <PostList />
      </Grid>
      <Box
        sx={{
          position: 'fixed',
          bottom: '10px',
          right: '50%',
          transform: 'translateX(50%)',
          width: '200px',
          height: '50px',
          borderRadius: '20px',
          backgroundColor: 'red',
        }}
      ></Box>
    </Grid>
  )
}
