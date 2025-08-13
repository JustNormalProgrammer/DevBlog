import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'

export function PostSkeleton() {
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      {/* For variant="text", adjust the height via font-size */}
      <Skeleton variant="text" height={120} />

      {/* For other variants, adjust the size with `width` and `height` */}
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <Skeleton
            variant="circular"
            width={50}
            height={50}
            sx={{ alignSelf: 'center' }}
          />
          <Skeleton variant="text" width={150} height={40} />
        </Stack>
        <Skeleton
          variant="text"
          width={150}
          height={40}
          sx={{ alignSelf: 'center' }}
        />
      </Stack>
      <Skeleton variant="rectangular" height={1000} />
    </Stack>
  )
}
export function CommentSkeleton() {
  return (
    <Paper sx={{ padding: 2 }} elevation={2}>
      <Stack spacing={1}>
        <Stack direction={'row'} justifyContent={'space-between'}>
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={100} />
          </Stack>
          <Skeleton
            variant="text"
            width={'150px'}
            sx={{ alignSelf: 'flex-end' }}
          />
        </Stack>

        <Skeleton variant="text" width={'100%'} />
      </Stack>
    </Paper>
  )
}
export function CommentSkeletonList() {
  return (
    <Stack spacing={3}>
      {Array.from({ length: 5 }).map((_, index) => (
        <CommentSkeleton key={index} />
      ))}
    </Stack>
  )
}
export function PostListSkeleton() {
  return Array.from({ length: 10 }).map((_, index) => (
    <Grid size={{ xs: 12, md: 6 }} key={index}>
      <Paper elevation={5} sx={{ height: '300px', minWidth: '200px', p: 2 }}>
        <Stack
          justifyContent={'space-between'}
          height={'100%'}
          sx={{ height: '200px', minWidth: '200px' }}
        >
          <Skeleton variant="text" height={'100px'} />
          <Skeleton variant="text" width={'100%'} height={'50px'} />
          <Skeleton variant="text" width={'100%'} height={'50px'} />
        </Stack>
      </Paper>
    </Grid>
  ))
}
