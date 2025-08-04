import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import CssBaseline from '@mui/material/CssBaseline'
import {
  ThemeProvider,
  createTheme,
  useColorScheme,
} from '@mui/material/styles'
import { Stack } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
        </QueryClientProvider>
      </>
    )
  },
})

function MyApp() {
  const { mode, setMode } = useColorScheme()
  if (!mode) {
    return null
  }
  return (
    <Stack  p={2} alignItems={'center'} minHeight={'100vh'}>
      <Navbar setMode={setMode} mode={mode} />
      <Outlet />
      <TanStackRouterDevtools />
    </Stack>
  )
}
