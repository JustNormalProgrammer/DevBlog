import { createLink } from '@tanstack/react-router'
import {
  Box,
  Button,
  Divider,
  Link as MUILink,
  Stack,
  Typography,
} from '@mui/material'

const CustomLink = createLink(MUILink)

function MainLogo() {
  return (
    <CustomLink underline="none" to="/">
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          component="img"
          src="/favicon.svg"
          alt="Logo"
          sx={{
            width: 70,
            display: {
              xs: 'none',
              sm: 'block',
            },
          }}
        />
        <Typography
          variant="h1"
          sx={{
            fontWeight: 300,
            color: 'primary.main',
            fontSize: {
              xs: '2rem',
              sm: '3rem',
            },
          }}
        >
          DevBlog
        </Typography>
      </Stack>
    </CustomLink>
  )
}

export default function Navbar() {
  return (
    <Box component="header" sx={{ p: 2, width: '100%', color: 'text.primary' }}>
      <Box
        component="nav"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <MainLogo />
        <Stack direction="row" spacing={2}>
          <CustomLink underline="none" to="/login">
            <Button size="large">
              Login
            </Button>
          </CustomLink>
          <Divider orientation="vertical" variant="middle" flexItem />
          <CustomLink underline="none" to="/signup">
            <Button size="large" >
              Signup
            </Button>
          </CustomLink>
        </Stack>
      </Box>
    </Box>
  )
}
