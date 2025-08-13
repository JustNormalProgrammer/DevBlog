import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import CssBaseline from '@mui/material/CssBaseline'
import {
  ThemeProvider,
  createTheme,
  useColorScheme,
} from '@mui/material/styles'
import { Stack, Typography } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Navbar from '../components/Navbar'
import type { AuthContext } from '@/contexts/authProvider'

const queryClient = new QueryClient()

interface MyRouterContext {
  auth: AuthContext
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    const theme = createTheme({
      colorSchemes: {
        dark: true,
      },
    })
    return (
      <>
        <QueryClientProvider client={queryClient}>
          {' '}
          <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            <MyApp />
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} position="right" />
        </QueryClientProvider>
      </>
    )
  },
  notFoundComponent: () => {
    return (
      <Stack spacing={3}>
        <Typography variant="h1" color="textDisabled" textAlign={'center'}>
          404
        </Typography>
        <Typography variant="h5" color="textDisabled" textAlign={'center'}>
          Page not found
        </Typography>
      </Stack>
    )
  },
})

function MyApp() {
  const { mode, setMode } = useColorScheme()
  if (!mode) {
    return null
  }
  return (
    <Stack p={2} alignItems={'center'} minHeight={'100vh'}>
      <Navbar setMode={setMode} mode={mode} />
      <Stack
        sx={{ width: '100%', maxWidth: '1200px', marginTop: '48px' }}
        alignItems={'center'}
      >
        <Outlet />
      </Stack>
      <TanStackRouterDevtools />
    </Stack>
  )
}
