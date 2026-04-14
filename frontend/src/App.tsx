import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AuthGuard } from './components/AuthGuard'
import { CampaignDetailPage } from './pages/CampaignDetailPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { LoginPage } from './pages/LoginPage'
import { NewCampaignPage } from './pages/NewCampaignPage'
import './App.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff5d3d'
    },
    secondary: {
      main: '#1640d6'
    },
    background: {
      default: '#fff9f4',
      paper: '#fffefb'
    },
    text: {
      primary: '#1d2232',
      secondary: '#596177'
    }
  },
  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700
    },
    h5: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700
    },
    h6: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700
    }
  },
  shape: {
    borderRadius: 24
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          textTransform: 'none',
          fontWeight: 700
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28
        }
      }
    }
  }
})

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<AppShell />}>
            <Route
              path='/login'
              element={<LoginPage />}
            />
            <Route element={<AuthGuard />}>
              <Route
                path='/'
                element={
                  <Navigate
                    to='/campaigns'
                    replace
                  />
                }
              />
              <Route
                path='/campaigns'
                element={<CampaignsPage />}
              />
              <Route
                path='/campaigns/new'
                element={<NewCampaignPage />}
              />
              <Route
                path='/campaigns/:id'
                element={<CampaignDetailPage />}
              />
            </Route>
            <Route
              path='*'
              element={
                <Navigate
                  to='/campaigns'
                  replace
                />
              }
            />
          </Route>
        </Routes>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
