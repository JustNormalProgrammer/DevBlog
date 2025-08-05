import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'

export function PostSkeleton() {
  return (
    <Stack spacing={1} sx={{ width: '100%', maxWidth: '70ch' }}>
      {/* For variant="text", adjust the height via font-size */}
      <Skeleton variant="text" height={120} />

      {/* For other variants, adjust the size with `width` and `height` */}
      <Skeleton
        variant="circular"
        width={70}
        height={70}
        sx={{ alignSelf: 'center' }}
      />
      <Skeleton
        variant="text"
        width={150}
        height={50}
        sx={{ alignSelf: 'center' }}
      />

      <Skeleton variant="rectangular" height={600} />
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
            <Skeleton variant='text' width={100}/>
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
