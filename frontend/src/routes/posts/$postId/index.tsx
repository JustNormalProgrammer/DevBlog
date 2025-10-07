import {
  createFileRoute,
  notFound,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Stack from '@mui/material/Stack'
import { Paper, Typography, useColorScheme } from '@mui/material'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import { useEffect, useRef, useState } from 'react'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'motion/react'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import parse from 'html-react-parser'
import Prism from 'prismjs'
import axios from 'axios'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Tooltip from '@mui/material/Tooltip'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import TextField from '@mui/material/TextField'
import SendIcon from '@mui/icons-material/Send'

import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import type { CommentResponse, PostResponse } from '@/types'
import {
  CommentSkeletonList,
  PostSkeleton,
} from '@/components/skeletons/Skeletons'
import api from '@/utils/axios'
import StringAvatar from '@/components/primitives/StringAvatar'
import InternalServerError from '@/components/primitives/InternalServerError'
import { useAuth } from '@/contexts/authProvider'
import getAnonUsername from '@/utils/getAnonUsername'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'

export const Route = createFileRoute('/posts/$postId/')({
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
  commentListRef,
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

  const isFinished = scrollProgress === 100;

  function handleClick(scrollToTop: boolean) {
    if (scrollToTop) {
      window.scrollTo({top: 0, behavior: 'smooth'})
      return
    }
    commentListRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
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
      <Tooltip title={isFinished ? "Top" : "Comments"}>
        <IconButton
          aria-label="scroll to comments"
          color="primary"
          onClick={() => handleClick(isFinished)}
          sx={{
            transform: isFinished ? 'rotate(180deg)' : '',
            transition: '0.2s ease-in',
          }}
        >
          <KeyboardDoubleArrowDownIcon />
        </IconButton>
      </Tooltip>
    </Paper>
  )
}

function Comment({ comment }: { comment: CommentResponse }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const { postId } = Route.useParams()
  const [isActive, setIsActive] = useState(false)
  const apiPrivate = useAxiosPrivate()
  const { user } = useAuth()
  const query = useQueryClient()
  useEffect(() => {
    const handleActive = () => setIsActive(true)
    const handleInactive = () => setIsActive(false)

    ref.current?.addEventListener('mouseenter', handleActive)
    ref.current?.addEventListener('mouseleave', handleInactive)

    return () => {
      ref.current?.removeEventListener('mouseleave', handleInactive)
      ref.current?.removeEventListener('mouseenter', handleActive)
    }
  }, [])
  const handleCommentDelete = async (commentId: string) => {
    try {
      await apiPrivate.delete(`/posts/${postId}/comments/${commentId}`)
      query.invalidateQueries({ queryKey: ['posts', postId, 'comments'] })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Paper sx={{ padding: 2 }} elevation={2} key={comment.id} ref={ref}>
      <Stack spacing={3}>
        <Stack direction={'row'} justifyContent={'space-between'}>
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <StringAvatar style={{ width: '40px', height: '40px' }}>
              {comment.authorName}
            </StringAvatar>
            <Typography
              color={
                comment.isPublisher
                  ? 'warning'
                  : comment.isVerified
                    ? 'secondary'
                    : 'primary'
              }
              sx={{
                maxWidth: { xs: '100px', md: '200px' },
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {comment.authorName}
            </Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} spacing={2}>
            <Typography
              color="textDisabled"
              sx={{ typography: { xs: 'subtitle2', md: 'subtitle1' } }}
            >
              {comment.createdAt.split('T')[0]}
            </Typography>
            <AnimatePresence>
              {comment.authorName === user?.username && isActive && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  <Tooltip title="Delete">
                    <IconButton
                      aria-label="Delete comment"
                      color="error"
                      onClick={() => handleCommentDelete(comment.id)}
                    >
                      <DeleteOutlineIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
        </Stack>
        <Typography
          sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {comment.content}
        </Typography>
      </Stack>
    </Paper>
  )
}

function CommentList() {
  const { postId } = Route.useParams()
  const { isPending, isError, data } = useQuery<{}, {}, Array<CommentResponse>>(
    {
      queryKey: ['posts', postId, 'comments'],
      queryFn: async () => {
        try {
          const response = await api.get(`/posts/${postId}/comments`)
          return response.data
        } catch (e) {
          throw new Error('Failed to connect to the server')
        }
      },
      staleTime: 60 * 1000,
    },
  )

  if (isError) return <InternalServerError />
  if (isPending) return <CommentSkeletonList />
  if (data.length === 0)
    return <Typography color="textDisabled">No comments yet</Typography>
  return (
    <Stack spacing={2}>
      {data.map((comment) => {
        return <Comment comment={comment} key={comment.id} />
      })}
    </Stack>
  )
}

function AddCommentSection() {
  const { postId } = Route.useParams()
  const client = useQueryClient()
  const apiPrivate = useAxiosPrivate()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()
  const [submitError, setSubmitError] = useState('')
  const handleSubmit = async () => {
    try {
      if (isAuthenticated) {
        await apiPrivate.post(`/posts/${postId}/comments`, {
          content: value,
        })
      } else {
        await api.post(`/posts/${postId}/comments`, {
          content: value,
          anonymousAuthorName: getAnonUsername(),
        })
      }
      client.invalidateQueries({ queryKey: ['posts', postId, 'comments'] })
      setValue('')
    } catch (e) {
      setSubmitError('Failed to add comment')
    }
  }
  return (
    <Stack spacing={2}>
      <TextField
        label="Add comment"
        multiline
        maxRows={10}
        variant="standard"
        onFocus={(e) => {
          if (e.currentTarget.value.length > 1000) {
            setError('Comment cannot exceed 1000 characters')
          }
        }}
        onBlur={() => {
          setError('')
        }}
        value={value}
        error={!!error}
        helperText={error}
        onChange={(e) => {
          if (e.currentTarget.value.length > 1000) {
            setError('Comment cannot exceed 1000 characters')
          }
          if (!!error && e.currentTarget.value.length <= 1000) {
            setError('')
          }
          setValue(e.currentTarget.value)
        }}
      />
      {value && (
        <Stack direction={'row'} justifyContent={'flex-end'}>
          <Button
            variant="outlined"
            endIcon={<SendIcon />}
            disabled={value === '' || !!error}
            onClick={handleSubmit}
          >
            Send
          </Button>
        </Stack>
      )}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={!!submitError}
        key={'success'}
        autoHideDuration={5000}
        onClose={() => setSubmitError('')}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
          Failed to add comment
        </Alert>
      </Snackbar>
    </Stack>
  )
}

function RouteComponent() {
  const { postId } = Route.useParams()
  const ref = useRef<HTMLDivElement>(null)
  const commentListRef = useRef<HTMLSpanElement>(null)
  const { mode } = useColorScheme()
  const { user } = useAuth()

  const { isPending, isError, error, data } = useQuery<{}, Error, PostResponse>(
    {
      queryKey: ['posts', postId],
      queryFn: async () => {
        try {
          const response = await api.get(`/posts/${postId}`)
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
  if (isError) {
    if (error.message === 'Post not found') {
      throw notFound({ routeId: '/posts/$postId/' })
    }
    return <InternalServerError />
  }
  return (
    <Stack
      sx={{
        maxWidth: '850px',
        width: '100%',
        marginBottom: '50px',
        p: { xs: 0, sm: 4 },
      }}
      spacing={5}
    >
      {isPending ? (
        <PostSkeleton />
      ) : (
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
            <div style={{ width: '100%' }}>{parse(data.content)}</div>
          </Stack>
          <BottomNav
            ref={ref}
            commentListRef={commentListRef}
            extendedActions={data.username === user?.username && user.isAdmin}
          />
        </Box>
      )}
      <Typography
        sx={{ typography: { xs: 'h4', md: 'h3' } }}
        alignSelf={'flex-start'}
        ref={commentListRef}
      >
        Comments
      </Typography>
      <AddCommentSection />
      <CommentList />
    </Stack>
  )
}
