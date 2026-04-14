import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch } from '../app/hooks'
import { CampaignStatusBadge } from '../components/CampaignStatusBadge'
import { ErrorState } from '../components/ErrorState'
import { RateStat } from '../components/RateStat'
import { showNotification } from '../features/ui/uiSlice'
import {
  deleteCampaign,
  getCampaign,
  getErrorMessage,
  scheduleCampaign,
  sendCampaign
} from '../lib/mockApi'

const formatDateTime = (value: string | null) => {
  if (!value) {
    return 'Not scheduled'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value))
}

const mockScheduleTime = (): string => {
  const now = Date.now()
  return (now + 60 * 60 * 1000).toString() // Schedule 1 hour from now
}

export function CampaignDetailPage() {
  const { id = '' } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const campaignQuery = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaign(id),
    enabled: Boolean(id)
  })

  const scheduleMutation = useMutation({
    mutationFn: () => scheduleCampaign(id, mockScheduleTime()),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['campaign', id] }),
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      ])
      dispatch(
        showNotification({
          message: 'Campaign scheduled.',
          severity: 'success'
        })
      )
    }
  })

  const sendMutation = useMutation({
    mutationFn: () => sendCampaign(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['campaign', id] }),
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      ])
      dispatch(
        showNotification({ message: 'Campaign sent.', severity: 'success' })
      )
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCampaign(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      dispatch(
        showNotification({ message: 'Campaign deleted.', severity: 'success' })
      )
      navigate('/campaigns')
    }
  })

  const mutationError = [
    scheduleMutation.error,
    sendMutation.error,
    deleteMutation.error
  ]
    .filter(Boolean)
    .map((error) => getErrorMessage(error))[0]

  const campaign = campaignQuery.data

  if (campaignQuery.isLoading) {
    return (
      <Stack spacing={3}>
        <Box className='hero-panel hero-panel-compact'>
          <Skeleton
            variant='text'
            width={120}
            height={24}
          />
          <Skeleton
            variant='text'
            width='52%'
            height={64}
          />
          <Skeleton
            variant='text'
            width='72%'
          />
        </Box>
        <Grid
          container
          spacing={2.5}
        >
          <Grid size={{ xs: 12, md: 7 }}>
            <Card className='glass-panel'>
              <CardContent>
                <Stack spacing={2}>
                  <Skeleton
                    variant='rounded'
                    height={120}
                  />
                  <Skeleton
                    variant='rounded'
                    height={220}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card className='glass-panel'>
              <CardContent>
                <Stack spacing={2}>
                  <Skeleton
                    variant='rounded'
                    height={140}
                  />
                  <Skeleton
                    variant='rounded'
                    height={180}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    )
  }

  if (campaignQuery.isError) {
    return (
      <ErrorState
        title='Unable to load campaign'
        message={getErrorMessage(campaignQuery.error)}
        onRetry={() => void campaignQuery.refetch()}
      />
    )
  }

  if (!campaign) {
    return null
  }

  return (
    <Stack spacing={3}>
      <Box className='hero-panel hero-panel-compact'>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
              alignItems: { sm: 'center' }
            }}
          >
            <CampaignStatusBadge status={campaign.status} />
            <Typography color='text.secondary'>
              Scheduled: {formatDateTime(campaign.scheduledAt)}
            </Typography>
          </Box>
          <Box>
            <Typography variant='h3'>{campaign.name}</Typography>
            <Typography
              variant='h6'
              color='text.secondary'
              sx={{ mt: 1 }}
            >
              {campaign.subject}
            </Typography>
          </Box>
          <Typography
            color='text.secondary'
            sx={{ maxWidth: 820 }}
          >
            {campaign.body}
          </Typography>
        </Stack>
      </Box>

      {mutationError ? <Alert severity='error'>{mutationError}</Alert> : null}

      <Grid
        container
        spacing={2.5}
      >
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2.5}>
            <Card className='glass-panel'>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2
                    }}
                  >
                    <Box>
                      <Typography variant='h5'>Campaign stats</Typography>
                      <Typography
                        color='text.secondary'
                        sx={{ mt: 0.5 }}
                      >
                        Delivery and engagement percentages update once a
                        campaign is sent.
                      </Typography>
                    </Box>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                    >
                      {campaign.status === 'draft' ? (
                        <Button
                          variant='outlined'
                          onClick={() => scheduleMutation.mutate()}
                          disabled={
                            scheduleMutation.isPending || sendMutation.isPending
                          }
                        >
                          {scheduleMutation.isPending
                            ? 'Scheduling...'
                            : 'Schedule'}
                        </Button>
                      ) : null}
                      {campaign.status !== 'sent' ? (
                        <Button
                          variant='contained'
                          onClick={() => sendMutation.mutate()}
                          disabled={
                            sendMutation.isPending || scheduleMutation.isPending
                          }
                        >
                          {sendMutation.isPending ? 'Sending...' : 'Send'}
                        </Button>
                      ) : null}
                      <Button
                        color='error'
                        variant='text'
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                    </Stack>
                  </Box>

                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <RateStat
                        label='Open rate'
                        value={campaign.stats.openRate}
                        helper={`${campaign.stats.openedCount} of ${campaign.stats.totalRecipients} recipients opened`}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <RateStat
                        label='Send rate'
                        value={campaign.stats.sendRate}
                        helper={`${campaign.stats.deliveredCount} of ${campaign.stats.totalRecipients} recipients delivered`}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            <Card className='glass-panel'>
              <CardContent sx={{ p: 3 }}>
                <Typography variant='h5'>Message</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {campaign.body}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card className='glass-panel'>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant='h5'>Recipients</Typography>
                  <Typography
                    color='text.secondary'
                    sx={{ mt: 0.5 }}
                  >
                    {campaign.recipientEmails.length} queued contacts
                  </Typography>
                </Box>
                <List
                  disablePadding
                  sx={{ display: 'grid', gap: 1.25 }}
                >
                  {campaign.recipientEmails.map((email) => (
                    <ListItem
                      key={email}
                      className='recipient-item'
                      disablePadding
                    >
                      <ListItemText
                        primary={email}
                        secondary={`Send status: ${campaign.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
