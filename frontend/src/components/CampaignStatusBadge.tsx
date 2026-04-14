import Chip from '@mui/material/Chip'
import type { CampaignStatus } from '../types'

const statusMap: Record<
  CampaignStatus,
  { label: string; sx: { backgroundColor: string; color: string } }
> = {
  draft: {
    label: 'Draft',
    sx: {
      backgroundColor: 'rgba(88, 99, 122, 0.14)',
      color: '#4b5565'
    }
  },
  scheduled: {
    label: 'Scheduled',
    sx: {
      backgroundColor: 'rgba(17, 112, 255, 0.12)',
      color: '#0d5ddb'
    }
  },
  sent: {
    label: 'Sent',
    sx: {
      backgroundColor: 'rgba(12, 143, 91, 0.14)',
      color: '#0f7a4d'
    }
  }
}

type CampaignStatusBadgeProps = {
  status: CampaignStatus
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const config = statusMap[status]

  return (
    <Chip
      label={config.label}
      size='small'
      sx={{
        borderRadius: 999,
        fontWeight: 700,
        letterSpacing: '0.02em',
        ...config.sx
      }}
    />
  )
}
