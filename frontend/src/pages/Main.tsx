import { Grid, Input, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { useDebouncedCallback } from 'use-debounce'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import api from '@/utils/axios'

const route = getRouteApi('/')

function BottomNav() {
  const navigate = useNavigate()
  const { page, q } = route.useSearch()
  const [pages, setPages] = useState(10)
  const [paginationNavState, setPaginationNavState] = useState({
    hover: false,
    focus: false,
  })
  const paginationInput = useRef<HTMLInputElement>(null)
  const paginationWrapper = useRef<HTMLInputElement>(null)
  // at the time of writing this, i had no idea you could pass pseudo elements to 'sx' prop. Now im to lazy to change this
  const isPaginationNavActive = Object.values(paginationNavState).some(
    (value) => value,
  )
  const [pageValue, setPageValue] = useState(page)
  useEffect(() => {
    const getPages = async () => {
      try {
        const response = await api.get(`/posts/pages?query=${q}`)
        setPages(response.data.pages)
        console.log('Get post pages: ', response.data.pages)
      } catch (e) {
        console.log(e)
      }
    }
    getPages()
  }, [q])
  useEffect(() => {
    const focusInput = () => {
      paginationInput.current?.focus()
      paginationInput.current?.select()
    }
    paginationWrapper.current?.addEventListener('click', focusInput)
    return () =>
      paginationWrapper.current?.removeEventListener('click', focusInput)
  }, [])

  function handleNextPage() {
    const nextPage = page + 1
    setPageValue((prev) => prev + 1)
    navigate({ to: '/', search: { q, page: nextPage } })
  }
  function handlePreviousPage() {
    const previousPage = page - 1
    setPageValue((prev) => prev - 1)
    navigate({ to: '/', search: { q, page: previousPage } })
  }
  const debouncedNavigate = useDebouncedCallback((value: number) => {
    navigate({ to: '/', search: { q, page: value } })
  }, 400)
  function handlePaginationChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { value } = e.currentTarget
    const valueNum = Number(value)
    if (!Number.isFinite(valueNum) || valueNum < 1 || valueNum > pages) {
      return null
    }
    setPageValue(valueNum)
    debouncedNavigate(valueNum)
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: '10px',
        right: '50%',
        transform: 'translateX(50%)',
        height: '50px',
        borderRadius: '20px',
        display: 'flex',
        gap: '10px',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      elevation={10}
    >
      <IconButton
        aria-label="previous page"
        color="primary"
        disabled={page === 1}
        onClick={handlePreviousPage}
      >
        <ArrowBackIcon />
      </IconButton>
      <Box
        onMouseEnter={() =>
          setPaginationNavState((prev) => ({ ...prev, hover: true }))
        }
        onMouseLeave={() =>
          setPaginationNavState((prev) => ({ ...prev, hover: false }))
        }
        ref={paginationWrapper}
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
      >
        <Box
          sx={{
            height: '40px',
            width: '40px',
            border: `2px solid`,
            borderColor: paginationNavState.focus ? 'primary.main' : 'grey.400',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Input
            inputRef={paginationInput}
            inputMode="numeric"
            onFocus={() =>
              setPaginationNavState((prev) => ({ ...prev, focus: true }))
            }
            onBlur={() =>
              setPaginationNavState((prev) => ({ ...prev, focus: false }))
            }
            value={pageValue}
            onChange={(e) => handlePaginationChange(e)}
            disableUnderline
            slotProps={{
              input: {
                style: {
                  textAlign: 'center',
                },
              },
            }}
          />
        </Box>
        <AnimatePresence>
          {isPaginationNavActive && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {' '}
              <Typography variant="subtitle1" color="textDisabled" noWrap>
                of {pages}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
      <IconButton
        aria-label="next page"
        color="primary"
        onClick={handleNextPage}
        disabled={page === pages}
      >
        <ArrowForwardIcon />
      </IconButton>
    </Paper>
  )
}

function PostList() {
  const { page, q } = route.useSearch()

  const { isPending, isError, error, data, isFetching, isPlaceholderData } =
    useQuery({
      queryKey: ['posts', page, q],
      queryFn: async () => {
        try {
          const response = await api.get(`/posts/?query=${q}&page=${page}`)
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
        width: '100%',
      }}
    >
      {data.map((post, index) => (
        <Grid
          key={post.id}
          size={{ xs: 12, md: 6 }}
          maxWidth={'1000px'}
          component={Link}
          sx={{ textDecoration: 'none' }}
          to={`/posts/${post.id}`}
        >
          <Paper elevation={5} sx={{ height: '300px', minWidth: '200px' }}>
            <h1>{post.title}</h1>
            <p>{post.id}</p>
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
    <Grid
      container
      flexGrow={1}
      direction={'column'}
      my={6}
      marginBottom={'50px'}
    >
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
      <BottomNav />
    </Grid>
  )
}
