import { keepPreviousData, useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CampaignStatusBadge } from '../components/CampaignStatusBadge'
import { ErrorState } from '../components/ErrorState'
import { LoadingCard } from '../components/LoadingCard'
import { listCampaigns, getErrorMessage } from '../lib/mockApi'
import { formatDate } from '../helpers/formatDate'

const PAGE_SIZE = 6

export function CampaignsPage() {
  const [page, setPage] = useState(1)

  const campaignsQuery = useQuery({
    queryKey: ['campaigns', page],
    queryFn: () => listCampaigns(page, PAGE_SIZE),
    placeholderData: keepPreviousData
  })

  return (
    <Stack spacing={3}>
      <Box className='hero-panel hero-panel-compact'>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2
          }}
        >
          <Box>
            <Typography
              variant='overline'
              sx={{ color: 'primary.main', letterSpacing: '0.2em' }}
            >
              Campaigns
            </Typography>
            <Typography
              variant='h3'
              sx={{ mt: 1 }}
            >
              Active outbound queue
            </Typography>
            <Typography
              color='text.secondary'
              sx={{ mt: 1, maxWidth: 680 }}
            >
              Review drafts, monitor scheduled sends, and jump into performance
              details from a single list.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to='/campaigns/new'
            variant='contained'
          >
            Create campaign
          </Button>
        </Box>
      </Box>

      {campaignsQuery.isLoading ? (
        <Grid
          container
          spacing={2.5}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid
              key={index}
              size={{ xs: 12, md: 6 }}
            >
              <LoadingCard />
            </Grid>
          ))}
        </Grid>
      ) : null}

      {campaignsQuery.isError ? (
        <ErrorState
          title='Unable to load campaigns'
          message={getErrorMessage(campaignsQuery.error)}
          onRetry={() => void campaignsQuery.refetch()}
        />
      ) : null}

      {campaignsQuery.data ? (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Typography
              variant='body1'
              color='text.secondary'
            >
              {campaignsQuery.data.total} campaigns total
            </Typography>
            {campaignsQuery.isFetching ? (
              <Typography color='text.secondary'>Refreshing...</Typography>
            ) : null}
          </Box>

          <Grid
            container
            spacing={2.5}
          >
            {campaignsQuery.data.items.map((campaign) => (
              <Grid
                key={campaign.id}
                size={{ xs: 12, md: 6 }}
              >
                <Card className='glass-panel'>
                  <CardActionArea
                    component={RouterLink}
                    to={`/campaigns/${campaign.id}`}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 2,
                            flexWrap: 'wrap'
                          }}
                        >
                          <CampaignStatusBadge status={campaign.status} />
                          <Typography
                            variant='body2'
                            color='text.secondary'
                          >
                            Updated {formatDate(campaign.updatedAt)}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant='h5'>{campaign.name}</Typography>
                          <Typography
                            variant='subtitle1'
                            color='text.secondary'
                            sx={{ mt: 0.5 }}
                          >
                            {campaign.subject}
                          </Typography>
                        </Box>

                        <Typography color='text.secondary'>
                          {campaign.body}
                        </Typography>

                        <Box className='inline-note'>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 2,
                              flexWrap: 'wrap'
                            }}
                          >
                            <Typography variant='body2'>
                              Recipients: {campaign.stats.totalRecipients}
                            </Typography>
                            <Typography variant='body2'>
                              Delivered: {campaign.stats.deliveredCount}
                            </Typography>
                            <Typography variant='body2'>
                              Open rate: {campaign.stats.openRate}%
                            </Typography>
                            <Typography variant='body2'>
                              Send rate: {campaign.stats.sendRate}%
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <Typography
                            sx={{ color: 'primary.main', fontWeight: 700 }}
                          >
                            View details
                          </Typography>
                          <Typography color='primary.main'>Explore</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              page={page}
              count={campaignsQuery.data.totalPages}
              onChange={(_, nextPage) => setPage(nextPage)}
              color='primary'
              shape='rounded'
            />
          </Box>
        </>
      ) : null}
    </Stack>
  )
}
