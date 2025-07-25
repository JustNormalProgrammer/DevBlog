import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import { AuthProvider } from '@/contexts/authProvider'

export const Route = createRootRoute({
  component: () => {
    const [light, setLight] = useState(true)
    const themeLight = createTheme({
      colorSchemes: {
        dark: false,
      },
    })

    const themeDark = createTheme({
      colorSchemes: {
        dark: true,
      },
    })
    return (
      <>
        <AuthProvider>
          <ThemeProvider theme={light ? themeLight : themeDark}>
            <CssBaseline enableColorScheme />
            <Navbar />
            <Outlet />
            <TanStackRouterDevtools />
          </ThemeProvider>
        </AuthProvider>
      </>
    )
  },
})
