import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

type RateStatProps = {
  label: string
  value: number
  helper: string
}

export function RateStat({ label, value, helper }: RateStatProps) {
  return (
    <Box className='metric-panel'>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 2
        }}
      >
        <Typography
          variant='subtitle2'
          color='text.secondary'
        >
          {label}
        </Typography>
        <Typography variant='h4'>{value}%</Typography>
      </Box>
      <LinearProgress
        variant='determinate'
        value={value}
        sx={{
          mt: 1.5,
          height: 10,
          borderRadius: 999,
          backgroundColor: 'rgba(10, 27, 56, 0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            background: 'linear-gradient(90deg, #ff8a47 0%, #ff5d3d 100%)'
          }
        }}
      />
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mt: 1 }}
      >
        {helper}
      </Typography>
    </Box>
  )
}
