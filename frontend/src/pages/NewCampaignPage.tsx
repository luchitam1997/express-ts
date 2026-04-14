import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../app/hooks'
import { showNotification } from '../features/ui/uiSlice'
import { createCampaign, getErrorMessage } from '../lib/mockApi'

const parseRecipients = (value: string) =>
  value
    .split(/[\n,]/g)
    .map((email) => email.trim())
    .filter(Boolean)

export function NewCampaignPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [recipients, setRecipients] = useState('')

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: (campaign) => {
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      dispatch(
        showNotification({
          message: `Campaign "${campaign.name}" created as a draft.`,
          severity: 'success'
        })
      )
      navigate(`/campaigns/${campaign.id}`)
    }
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate({
      name,
      subject,
      body,
      recipientEmails: parseRecipients(recipients)
    })
  }

  return (
    <Stack spacing={3}>
      <Box className='hero-panel hero-panel-compact'>
        <Typography
          variant='overline'
          sx={{ color: 'primary.main', letterSpacing: '0.2em' }}
        >
          Create Campaign
        </Typography>
        <Typography
          variant='h3'
          sx={{ mt: 1 }}
        >
          Draft the next campaign
        </Typography>
        <Typography
          color='text.secondary'
          sx={{ mt: 1, maxWidth: 680 }}
        >
          Add the campaign name, subject line, message body, and recipient list.
          The draft is saved immediately to the mocked API store.
        </Typography>
      </Box>

      <Card className='glass-panel'>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            component='form'
            spacing={2.5}
            onSubmit={handleSubmit}
          >
            {createMutation.isError ? (
              <Alert severity='error'>
                {getErrorMessage(createMutation.error)}
              </Alert>
            ) : null}

            <TextField
              label='Campaign name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              fullWidth
            />
            <TextField
              label='Subject'
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              fullWidth
            />
            <TextField
              label='Body'
              value={body}
              onChange={(event) => setBody(event.target.value)}
              multiline
              minRows={8}
              fullWidth
            />
            <TextField
              label='Recipient emails'
              value={recipients}
              onChange={(event) => setRecipients(event.target.value)}
              multiline
              minRows={6}
              helperText='Separate addresses with commas or new lines.'
              fullWidth
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'space-between'
              }}
            >
              <Box
                className='inline-note'
                sx={{ flex: 1 }}
              >
                <Typography variant='body2'>
                  Example recipients: alex@company.com, team@company.com,
                  growth@company.com
                </Typography>
              </Box>
              <Button
                type='submit'
                variant='contained'
                size='large'
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : 'Create draft'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
