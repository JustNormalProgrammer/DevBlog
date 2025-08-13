import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function InternalServerError() {
  return (
    <Stack spacing={3}>
      <Typography variant="h1" color="textDisabled" textAlign={'center'}>
        :&#40;
      </Typography>
      <Typography variant="h5" color="textDisabled" textAlign={'center'}>
        We are currently experiencing a problem. Try again later
      </Typography>
    </Stack>
  )
}
