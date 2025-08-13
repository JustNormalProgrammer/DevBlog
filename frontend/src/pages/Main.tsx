import { Checkbox, Grid, Input, Stack, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { useDebouncedCallback } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '@/utils/axios'
import InternalServerError from '@/components/primitives/InternalServerError'
import StringAvatar from '@/components/primitives/StringAvatar'
import { PostListSkeleton } from '@/components/skeletons/Skeletons'
import { useAuth } from '@/contexts/authProvider'
import BottomNav from '@/components/MainPage/MainBottomNav'
import PostList from '@/components/PostList'

const route = getRouteApi('/')

// function PostList() {
//   const { page, q } = route.useSearch()

//   const { isPending, isError, error, data } = useQuery({
//     queryKey: ['posts', page, q],
//     queryFn: async () => {
//       try {
//         const response = await api.get(`/posts/?query=${q}&page=${page}`)
//         return [...response.data]
//       } catch (e) {
//         throw new Error('Failed to connect to the server')
//       }
//     },
//     staleTime: 60 * 1000,
//   })

//   if (isError) return <InternalServerError />

//   return (
//     <>
//       <Grid
//         container
//         spacing={3}
//         my={3}
//         sx={{
//           justifyContent: 'center',
//           alignItems: 'center',
//           width: '100%',
//         }}
//       >
//         {isPending ? (
//           <PostListSkeleton />
//         ) : (
//           <>
//             {data.map((post, index) => (
//               <Grid
//                 key={post.id}
//                 size={{ xs: 12, md: 6 }}
//                 component={Link}
//                 sx={{ textDecoration: 'none', userSelect: 'text' }}
//                 to={`/posts/${post.id}`}
//               >
//                 <Paper
//                   elevation={5}
//                   sx={{ height: '300px', minWidth: '200px', p: 2 }}
//                 >
//                   <Stack justifyContent={'space-between'} height={'100%'}>
//                     <Typography
//                       sx={{
//                         typography: { xs: 'h5', md: 'h4' },
//                         wordBreak: { xs: 'break-all', md: 'initial' },
//                         maxWidth: { xs: '100%', md: '500px' },
//                         textOverflow: 'ellipsis',
//                         overflow: 'hidden',
//                       }}
//                     >
//                       {post.title}
//                     </Typography>
//                     <Stack
//                       direction={'row'}
//                       justifyContent={'space-between'}
//                       alignItems={'center'}
//                     >
//                       <Stack
//                         direction={'row'}
//                         spacing={1}
//                         alignItems={'center'}
//                       >
//                         <StringAvatar
//                           style={{
//                             width: '30px',
//                             height: '30px',
//                             alignSelf: 'center',
//                             fontSize: '1rem',
//                           }}
//                         >
//                           {post.username}
//                         </StringAvatar>
//                         <Typography variant="h5">{post.username}</Typography>
//                       </Stack>
//                       <Typography
//                         sx={{
//                           typography: { xs: 'subtitle2', md: 'subtitle1' },
//                         }}
//                         color="textDisabled"
//                       >
//                         {post.createdAt.split('T')[0]}
//                       </Typography>
//                     </Stack>
//                   </Stack>
//                 </Paper>
//               </Grid>
//             ))}
//             {data.length < 10 && (
//               <Typography
//                 variant="h3"
//                 color="textDisabled"
//                 flexBasis={'100%'}
//                 textAlign={'center'}
//               >
//                 No more posts
//               </Typography>
//             )}
//           </>
//         )}

//       </Grid>
//     </>
//   )
// }

export default function Main() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { q, page } = route.useSearch()
  const handleSearch = useDebouncedCallback((term: string) => {
    console.log('search', term)
    navigate({ to: '/', search: { q: term, page: 1 }, replace: true })
  }, 300)
  const {
    isPending,
    isError,
    data: posts,
  } = useQuery({
    queryKey: ['posts', page, q],
    queryFn: async () => {
      const response = await api.get(`/posts?query=${q}&page=${page}`)
      return [...response.data]
    },
    staleTime: 60 * 1000,
  })
  const { data: pages } = useQuery({
    queryKey: ['posts', 'pages', q],
    queryFn: async () => {
      const response = await api.get(`/posts/pages?query=${q}`)
      console.log(response)
      return response.data
    },
    staleTime: 60 * 1000,
  })
  if (isError) {
    return <InternalServerError />
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
                onChange={() =>
                  navigate({ to: '/hidden', search: { q: q, page: 1 } })
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
        <PostList q={q} page={page} isPending={isPending} posts={posts} />
      </Grid>
      <BottomNav q={q} page={page} isShowingHiddenPosts={false} pages={pages} />
    </Grid>
  )
}
