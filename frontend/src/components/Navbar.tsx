import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { CustomLink } from './primitives/CustomLink'
import StringAvatar from './primitives/StringAvatar'
import type { User } from '@/types'
import { useAuth } from '@/contexts/authProvider'

function MainLogo() {
  return (
    <CustomLink underline="none" to="/" search={{ q: '', page: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box component="img" src="/favicon.svg" alt="Logo" width={70} />
        <Typography
          variant="h1"
          sx={{
            fontWeight: 300,
            color: 'primary.main',
            fontSize: {
              xs: '2rem',
              sm: '3rem',
            },
            display: {
              xs: 'none',
              sm: 'block',
            },
          }}
        >
          DevBlog
        </Typography>
      </Stack>
    </CustomLink>
  )
}

function AuthLinks() {
  return (
    <>
      <CustomLink underline="none" to="/login">
        <Button size="large">Login</Button>
      </CustomLink>
      <Divider orientation="vertical" variant="middle" flexItem />
      <CustomLink underline="none" to="/signup">
        <Button size="large">Signup</Button>
      </CustomLink>
    </>
  )
}
function Profile({
  user,
  logout,
}: {
  user: User
  logout: () => Promise<void>
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleLogout = () => {
    setAnchorEl(null)
    logout()
  }
  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <StringAvatar
          style={{ width: '70px', height: '70px', fontSize: '2.2rem' }}
        >
          {user.username}
        </StringAvatar>
      </IconButton>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  )
}
type Mode = 'dark' | 'light' | undefined
export default function Navbar({
  setMode,
}: {
  setMode: (mode: Mode | null) => void
}) {
  const { user, logout } = useAuth()
  return (
    <Box component="header" sx={{ width: '100%' }}>
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
          <Checkbox
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMode(e.currentTarget.checked ? 'light' : 'dark')
            }
          />
          {user?.username ? (
            <Profile user={user} logout={logout} />
          ) : (
            <AuthLinks />
          )}
        </Stack>
      </Box>
    </Box>
  )
}
