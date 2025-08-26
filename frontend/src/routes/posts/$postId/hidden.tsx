import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Stack from '@mui/material/Stack'
import { Paper, Typography, useColorScheme } from '@mui/material'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import { useEffect, useRef, useState } from 'react'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import { useMotionValueEvent, useScroll } from 'motion/react'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import parse from 'html-react-parser'
import Prism from 'prismjs'
import axios from 'axios'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Tooltip from '@mui/material/Tooltip'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { PostResponse } from '@/types'
import { PostSkeleton } from '@/components/skeletons/Skeletons'
import StringAvatar from '@/components/primitives/StringAvatar'
import InternalServerError from '@/components/primitives/InternalServerError'
import { useAuth } from '@/contexts/authProvider'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'

export const Route = createFileRoute('/posts/$postId/hidden')({
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
  notFoundComponent: () => {
    return (
      <Stack spacing={3}>
        <Typography variant="h1" color="textDisabled" textAlign={'center'}>
          404
        </Typography>
        <Typography variant="h5" color="textDisabled" textAlign={'center'}>
          Post not found
        </Typography>
      </Stack>
    )
  },
})

function BottomNav({
  ref,
  extendedActions = false,
}: {
  ref: React.RefObject<HTMLDivElement | null>
  commentListRef: React.RefObject<HTMLSpanElement | null>
  extendedActions: boolean
}) {
  const { history } = useRouter()
  const apiPrivate = useAxiosPrivate()
  const { postId } = Route.useParams()
  const queryClient = useQueryClient()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  })
  const [scrollProgress, setScrollProgress] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (current) => {
    setScrollProgress(current * 100)
  })
  const navigate = useNavigate()
  const handleDelete = async () => {
    try {
      await apiPrivate.delete(`/posts/${postId}`)
      navigate({ to: '/', search: { page: 1, q: '' } })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    } catch (e) {
      console.log(e)
    }
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
        zIndex: '9999',
      }}
      elevation={10}
    >
      <Tooltip title="Back">
        <IconButton
          aria-label="back"
          color="primary"
          onClick={() => history.go(-1)}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      {extendedActions && (
        <Tooltip title="Edit">
          <IconButton
            aria-label="Edit post"
            color="info"
            onClick={() =>
              navigate({ to: '/posts/$postId/edit', params: { postId } })
            }
          >
            <EditNoteOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" value={scrollProgress} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{ color: 'text.secondary' }}
          >{`${Math.round(scrollProgress)}%`}</Typography>
        </Box>
      </Box>
      {extendedActions && (
        <Tooltip title="Delete">
          <IconButton
            aria-label="Delete post"
            color="error"
            onClick={handleDelete}
          >
            <DeleteOutlineIcon color="error" />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  )
}

function RouteComponent() {
  const { postId } = Route.useParams()
  const ref = useRef<HTMLDivElement>(null)
  const commentListRef = useRef<HTMLSpanElement>(null)
  const { mode } = useColorScheme()
  const { user } = useAuth()
  const apiPrivate = useAxiosPrivate()

  const { isPending, isError, error, data } = useQuery<{}, Error, PostResponse>(
    {
      queryKey: ['posts', postId, 'hidden'],
      queryFn: async () => {
        try {
          const response = await apiPrivate.get(`/posts/${postId}/hidden`)
          return response.data
        } catch (e) {
          if (axios.isAxiosError(e)) {
            if (e.response?.status === 404) {
              throw new Error('Post not found')
            }
          }
          throw new Error('Failed to connect to the server')
        }
      },
      staleTime: 60 * 1000,
    },
  )
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.id = 'prism-theme'
    link.href = mode === 'dark' ? '/darkPrism.css' : '/prism.css'

    document.head.appendChild(link)

    link.onload = () => {
      Prism.highlightAll()
    }

    return () => {
      const existing = document.querySelector('#prism-theme')
      if (existing) existing.remove()
    }
  }, [mode, data])
  if (!mode) {
    return null
  }
  if (isPending) return <PostSkeleton />
  if (isError) {
    if (error.message === 'Post not found') {
      throw notFound({ routeId: '/posts/$postId/' })
    }
    return <InternalServerError />
  }
  const parsedContent = parse(data.content)
  const isLoggedInUsersPost = data.username === user?.username && user.isAdmin
  return (
    <Stack
      sx={{ maxWidth: '850px', width: '100%', marginBottom: '50px', p: 4 }}
      spacing={5}
    >
      <Box sx={{ marginTop: '40px' }} ref={ref}>
        <Stack alignItems={'center'}>
          <Stack spacing={3} sx={{ width: '100%' }}>
            <Typography
              sx={{
                typography: { xs: 'h4', md: 'h3' },
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {data.title}
            </Typography>
            <Stack
              direction={{ md: 'row' }}
              justifyContent={{ xs: 'center', md: 'space-between' }}
            >
              <Stack
                direction={'row'}
                spacing={1}
                justifyContent={{ xs: 'center', md: 'space-between' }}
                alignItems={'center'}
              >
                <StringAvatar
                  style={{
                    width: '30px',
                    height: '30px',
                    alignSelf: 'center',
                    fontSize: '1rem',
                  }}
                >
                  {data.username}
                </StringAvatar>
                <Typography variant="h5">{data.username}</Typography>
              </Stack>
              <Typography
                sx={{
                  typography: { xs: 'subtitle2', md: 'subtitle1' },
                  textAlign: { xs: 'center' },
                  marginTop: { xs: 2, md: 0 },
                }}
                color="textDisabled"
              >
                Last Modified: {data.createdAt.split('T')[0]}
              </Typography>
            </Stack>
          </Stack>
          <Divider variant="middle" sx={{ my: 2 }} flexItem />
          <div style={{ width: '100%' }}>{parsedContent}</div>
        </Stack>
        <BottomNav
          ref={ref}
          commentListRef={commentListRef}
          extendedActions={isLoggedInUsersPost}
        />
      </Box>
    </Stack>
  )
}
