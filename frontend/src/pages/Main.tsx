import { Grid, Input } from '@mui/material'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { getRouteApi, useNavigate, useSearch } from '@tanstack/react-router'
import { useDebouncedCallback } from 'use-debounce'

const route = getRouteApi('/')

function PostList() {
  return ''
}

export default function Main() {
  const navigate = useNavigate()
  const { q } = route.useSearch()
  const search = q || ''
  const handleSearch = useDebouncedCallback((term: string) => {
    console.log('search', term)
    navigate({ to: '/', search: { q: term, page: 1 }, replace: true })
  }, 300)
  return (
    <Grid container flexGrow={1} direction={'column'} my={6}>
      <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={2}
          sx={{ padding: 2, maxWidth: '600px', width: '100%' }}
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
            defaultValue={search}
            onChange={(e) => handleSearch(e.currentTarget.value)}
          />
        </Paper>
      </Grid>
      <Grid width={'100%'} flexGrow={1}></Grid>
      <Box
        sx={{
          position: 'fixed',
          bottom: '10px',
          right: '50%',
          transform: 'translateX(50%)',
          width: '150px',
          height: '50px',
          borderRadius: '20px',
          backgroundColor: 'red',
        }}
      ></Box>
    </Grid>
  )
}
