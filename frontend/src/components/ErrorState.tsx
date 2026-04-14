import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type ErrorStateProps = {
  title: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <Box
      className='glass-panel'
      sx={{ p: 3.5 }}
    >
      <Stack spacing={2}>
        <Typography variant='h5'>{title}</Typography>
        <Alert severity='error'>{message}</Alert>
        {onRetry ? (
          <Button
            variant='contained'
            onClick={onRetry}
            sx={{ alignSelf: 'start' }}
          >
            Retry
          </Button>
        ) : null}
      </Stack>
    </Box>
  )
}
