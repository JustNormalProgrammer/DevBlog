import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import Stack from '@mui/material/Stack'
import { Paper, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import HomeIcon from '@mui/icons-material/Home'
import { useEffect, useRef, useState } from 'react'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import {
  CommentSkeletonList,
  PostSkeleton,
} from '@/components/skeletons/Skeletons'
import api from '@/utils/axios'
import StringAvatar from '@/components/primitives/StringAvatar'

export const Route = createFileRoute('/posts/$postId')({
  component: RouteComponent,
})

type PostResponse = {
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  title: string
  content: string
  isPublic: boolean
  username: string
}
type CommentResponse = {
  id: string
  userId: string
  postId: string
  createdAt: string
  updatedAt: string
  content: string
  authorName: string
  isPublisher: boolean
  isVerified: boolean
}

function BottomNav({
  ref,
  commentListRef,
}: {
  ref: React.RefObject<HTMLDivElement | null>
  commentListRef: React.RefObject<HTMLSpanElement | null>
}) {
  const { scrollYProgress } = useScroll({
    target: ref,
  })
  const [scrollProgress, setScrollProgress] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (current) => {
    setScrollProgress(current * 100)
  })

  useEffect(() => {
    console.dir(scrollYProgress)
  }, [scrollYProgress])
  const navigate = useNavigate()
  function handleClick() {
    commentListRef.current?.scrollIntoView({ behavior: 'smooth' })
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
        aria-label="home"
        color="primary"
        onClick={() => navigate({ to: '/', search: { q: '', page: 1 } })}
      >
        <HomeIcon />
      </IconButton>
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
      <IconButton
        aria-label="scroll to comments"
        color="primary"
        onClick={handleClick}
      >
        <KeyboardDoubleArrowDownIcon />
      </IconButton>
    </Paper>
  )
}

function CommentList() {
  const { postId } = Route.useParams()
  const { isPending, isError, error, data } = useQuery<
    {},
    {},
    Array<CommentResponse>
  >({
    queryKey: ['posts', postId, 'comments'],
    queryFn: async () => {
      try {
        const response = await api.get(`/posts/${postId}/comments`)
        return response.data
      } catch (e) {
        throw new Error('Failed to connect to the server')
      }
    },
  })
  if (isError) return 'Error'
  if (isPending) return <CommentSkeletonList />
  return (
    <Stack spacing={2}>
      {data.map((comment) => {
        return (
          <Paper sx={{ padding: 2 }} elevation={2} key={comment.id}>
            <Stack spacing={3}>
              <Stack direction={'row'} justifyContent={'space-between'}>
                <Stack direction={'row'} spacing={1} alignItems={'center'}>
                  <StringAvatar style={{ width: '40px', height: '40px' }}>
                    {comment.authorName}
                  </StringAvatar>
                  <Typography
                    sx={{
                      maxWidth: { xs: '100px', md: '200px' },
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {comment.authorName}
                  </Typography>
                </Stack>
                <Typography
                  color="textDisabled"
                  sx={{ typography: { xs: 'subtitle2', md: 'subtitle1' } }}
                >
                  {comment.createdAt.split('T')[0]}
                </Typography>
              </Stack>
              <Typography>{comment.content}</Typography>
            </Stack>
          </Paper>
        )
      })}
    </Stack>
  )
}

function RouteComponent() {
  const { postId } = Route.useParams()
  const ref = useRef<HTMLDivElement>(null)
  const commentListRef = useRef<HTMLSpanElement>(null)

  const { isPending, isError, error, data } = useQuery<{}, {}, PostResponse>({
    queryKey: ['posts', postId],
    queryFn: async () => {
      try {
        const response = await api.get(`/posts/${postId}`)
        return response.data
      } catch (e) {
        throw new Error('Failed to connect to the server')
      }
    },
  })
  if (isPending) return <PostSkeleton />
  if (isError) return null
  return (
    <Stack sx={{ maxWidth: '800px', width: '100%' }} spacing={5}>
      <Paper elevation={5} sx={{ marginTop: '40px', p: 6 }} ref={ref}>
        <Stack alignItems={'center'}>
          <Stack spacing={3} sx={{ width: '100%' }}>
            <Typography
              sx={{ typography: { xs: 'h5', md: 'h4' } }}
              
            >
              {data.title}
            </Typography>
            <Stack>
              <StringAvatar
                style={{
                  width: '70px',
                  height: '70px',
                  alignSelf: 'center',
                  fontSize: '2.2rem',
                }}
              >
                {data.username}
              </StringAvatar>
              <Typography variant={'h5'} sx={{ alignSelf: 'center' }}>
                {data.username}
              </Typography>
            </Stack>
            <Typography
              sx={{
                typography: { xs: 'subtitle2', md: 'subtitle1' },
                alignSelf: { xs: 'center', md: 'flex-end' },
              }}
              color="textDisabled"
            >
              Last Modified: {data.createdAt.split('T')[0]}
            </Typography>
          </Stack>
          <Divider variant="middle" sx={{ my: 2 }} flexItem />
          <Typography textAlign={'justify'} maxWidth={'70ch'}>
            {data.content}
          </Typography>
        </Stack>
        <BottomNav ref={ref} commentListRef={commentListRef}/>
      </Paper>
      <Typography variant="h2" alignSelf={'flex-start'} ref={commentListRef}>
        Comments
      </Typography>
      <CommentList />
    </Stack>
  )
}
