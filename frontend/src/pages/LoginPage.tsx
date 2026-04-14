import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setCredentials } from '../features/auth/authSlice'
import { showNotification } from '../features/ui/uiSlice'
import { demoCredentials, getErrorMessage, loginUser } from '../lib/mockApi'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const token = useAppSelector((state) => state.auth.token)
  const [email, setEmail] = useState(demoCredentials.email)

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ token: nextToken, user }) => {
      dispatch(setCredentials({ token: nextToken, userEmail: user.email }))
      dispatch(
        showNotification({
          message: 'Signed in. Campaign data is now available.',
          severity: 'success'
        })
      )

      const nextPath =
        typeof location.state === 'object' &&
        location.state !== null &&
        'from' in location.state &&
        typeof location.state.from === 'string'
          ? location.state.from
          : '/campaigns'

      navigate(nextPath, { replace: true })
    }
  })

  if (token) {
    return (
      <Navigate
        to='/campaigns'
        replace
      />
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginMutation.mutate({ email })
  }

  return (
    <Grid
      container
      spacing={3}
      sx={{ alignItems: 'stretch' }}
    >
      <Grid size={{ xs: 12, md: 7 }}>
        <Box className='hero-panel'>
          <Typography
            variant='overline'
            sx={{ color: 'primary.main', letterSpacing: '0.2em' }}
          >
            Sign In
          </Typography>
          <Typography
            variant='h2'
            sx={{ mt: 1, maxWidth: 560 }}
          >
            Manage campaign drafts, schedules, sends, and performance in one
            flow.
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ mt: 2, maxWidth: 520 }}
          >
            This frontend uses Redux for auth state, React Query for API data,
            and a mocked JWT session stored in memory.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 4 }}
          >
            <Box className='metric-panel'>
              <Typography
                variant='subtitle2'
                color='text.secondary'
              >
                Workflow coverage
              </Typography>
              <Typography
                variant='h4'
                sx={{ mt: 1 }}
              >
                4 screens
              </Typography>
              <Typography color='text.secondary'>
                Login, list, create, and detail views.
              </Typography>
            </Box>
            <Box className='metric-panel'>
              <Typography
                variant='subtitle2'
                color='text.secondary'
              >
                API feedback
              </Typography>
              <Typography
                variant='h4'
                sx={{ mt: 1 }}
              >
                Meaningful
              </Typography>
              <Typography color='text.secondary'>
                Loading, validation, and mutation errors are surfaced clearly.
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card className='glass-panel'>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack
              component='form'
              spacing={2.5}
              onSubmit={handleSubmit}
            >
              <Box>
                <Typography variant='h4'>Welcome back</Typography>
                <Typography
                  color='text.secondary'
                  sx={{ mt: 1 }}
                >
                  Use the seeded demo credentials below or any valid email with
                  a six-character password.
                </Typography>
              </Box>

              {loginMutation.isError ? (
                <Alert severity='error'>
                  {getErrorMessage(loginMutation.error)}
                </Alert>
              ) : null}

              <TextField
                label='Email'
                type='email'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
              />

              {/* <Box className='inline-note'>
                <Typography variant='body2'>
                  Demo: {demoCredentials.email} / {demoCredentials.password}
                </Typography>
              </Box> */}

              <Button
                type='submit'
                variant='contained'
                size='large'
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
