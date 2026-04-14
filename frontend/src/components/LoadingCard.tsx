import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export function LoadingCard() {
  return (
    <Card className='glass-panel'>
      <CardContent>
        <Stack spacing={1.25}>
          <Skeleton
            variant='rounded'
            width={88}
            height={30}
          />
          <Skeleton
            variant='text'
            width='68%'
            height={38}
          />
          <Skeleton
            variant='text'
            width='92%'
          />
          <Skeleton
            variant='text'
            width='80%'
          />
          <Skeleton
            variant='rounded'
            width='100%'
            height={56}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
