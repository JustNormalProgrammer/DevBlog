import { Grid, Stack, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import { Link } from '@tanstack/react-router'
import StringAvatar from '@/components/primitives/StringAvatar'
import { PostListSkeleton } from '@/components/skeletons/Skeletons'

export default function PostList({
  isPending,
  posts,
  isShowingHiddenPosts = false,
}: {
  isShowingHiddenPosts?: boolean
  page: number
  q: string
  isPending: boolean
  posts: Array<any> | undefined
}) {
  return (
    <>
      <Grid
        container
        spacing={3}
        my={3}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {isPending ? (
          <PostListSkeleton />
        ) : (
          <>
            {posts!.map((post) => (
              <Grid
                key={post.id}
                size={{ xs: 12, md: 6 }}
                component={Link}
                sx={{ textDecoration: 'none', userSelect: 'text' }}
                to={`/posts/${post.id}${isShowingHiddenPosts ? '/hidden' : ''}`}
              >
                <Paper
                  elevation={5}
                  sx={{ height: '300px', minWidth: '200px', p: 2 }}
                >
                  <Stack justifyContent={'space-between'} height={'100%'}>
                    <Typography
                      sx={{
                        typography: { xs: 'h5', md: 'h4' },
                        wordBreak: { xs: 'break-all', md: 'initial' },
                        maxWidth: { xs: '100%', md: '500px' },
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Stack
                      direction={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Stack
                        direction={'row'}
                        spacing={1}
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
                          {post.username}
                        </StringAvatar>
                        <Typography variant="h5">{post.username}</Typography>
                      </Stack>
                      <Typography
                        sx={{
                          typography: { xs: 'subtitle2', md: 'subtitle1' },
                        }}
                        color="textDisabled"
                      >
                        {post.createdAt.split('T')[0]}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
            {posts!.length < 10 && (
              <Typography
                variant="h3"
                color="textDisabled"
                flexBasis={'100%'}
                textAlign={'center'}
              >
                No more posts
              </Typography>
            )}
          </>
        )}
      </Grid>
    </>
  )
}
