import { createFileRoute } from '@tanstack/react-router'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Button, Divider } from '@mui/material'
import { CustomLink } from '@/components/primitives/CustomLink'

export const Route = createFileRoute('/forbidden')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Stack
      direction={'column'}
      alignItems={'center'}
      flexGrow={1}
      marginTop={'40px'}
      spacing={2}
    >
      <Stack alignItems={'center'} >
        <Typography variant="h1" color="textDisabled">
          403
        </Typography>
        <Typography variant="h5" color="textDisabled" textAlign={'center'}>
          You are not allowed to view this resource
        </Typography>
      </Stack>
      <CustomLink underline="none" to="/">
        <Button size="large">Home</Button>
      </CustomLink>
    </Stack>
  )
}
