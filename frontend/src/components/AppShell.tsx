import Alert from '@mui/material/Alert'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Snackbar from '@mui/material/Snackbar'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { clearCredentials } from '../features/auth/authSlice'
import { clearNotification } from '../features/ui/uiSlice'
import { logoutUser } from '../lib/mockApi'

export function AppShell() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const token = useAppSelector((state) => state.auth.token)
  const userEmail = useAppSelector((state) => state.auth.userEmail)
  const notification = useAppSelector((state) => state.ui.notification)

  const handleLogout = () => {
    logoutUser()
    dispatch(clearCredentials())
    dispatch(clearNotification())
    queryClient.clear()
    navigate('/login')
  }

  return (
    <Box className='app-shell'>
      <AppBar
        position='sticky'
        elevation={0}
        color='transparent'
        className='app-bar'
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              width: '100%'
            }}
          >
            <Box>
              <Typography
                variant='overline'
                sx={{ color: 'primary.main', letterSpacing: '0.2em' }}
              >
                Campaign Console
              </Typography>
              <Typography variant='h6'>
                Outbound workflow for product and growth teams
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1.5,
                alignItems: { sm: 'center' }
              }}
            >
              {token ? (
                <>
                  <Button
                    variant={
                      location.pathname === '/campaigns' ? 'contained' : 'text'
                    }
                    onClick={() => navigate('/campaigns')}
                  >
                    Campaigns
                  </Button>
                  <Button
                    variant={
                      location.pathname === '/campaigns/new'
                        ? 'contained'
                        : 'text'
                    }
                    onClick={() => navigate('/campaigns/new')}
                  >
                    New Campaign
                  </Button>
                </>
              ) : null}
              {userEmail ? (
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  {userEmail}
                </Typography>
              ) : null}
              {token ? (
                <Button
                  variant='outlined'
                  color='inherit'
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : null}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth='lg'
        sx={{ py: { xs: 3, md: 5 } }}
      >
        <Outlet />
      </Container>

      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={3600}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={() => dispatch(clearNotification())}
      >
        <Alert
          onClose={() => dispatch(clearNotification())}
          severity={notification?.severity ?? 'info'}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
