import axios from 'axios'
import type {
  Campaign,
  CreateCampaignPayload,
  LoginPayload,
  LoginResponse,
  PaginatedCampaigns
} from '../types'

const PAGE_SIZE = 6

const session = {
  token: null as string | null
}
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

export const demoCredentials = {
  email: 'demo@northstar-mail.com',
  password: 'demo123'
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

const validateCampaignPayload = (payload: CreateCampaignPayload) => {
  if (!payload.name.trim()) {
    throw new ApiError('Campaign name is required.')
  }

  if (!payload.subject.trim()) {
    throw new ApiError('Subject is required before a campaign can be saved.')
  }

  if (!payload.body.trim()) {
    throw new ApiError('Email body cannot be empty.')
  }

  if (payload.recipientEmails.length === 0) {
    throw new ApiError('Add at least one recipient email address.')
  }

  const invalidEmail = payload.recipientEmails.find(
    (email) => !isValidEmail(email)
  )

  if (invalidEmail) {
    throw new ApiError(`Recipient email is invalid: ${invalidEmail}`)
  }
}

export const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export const loginUser = async (payload: LoginPayload) => {
  const response = await axios.post<LoginResponse>(
    `${API_BASE_URL}/auth/login`,
    payload
  )

  session.token = response.data.data.token

  return response.data.data
}

export const logoutUser = () => {
  session.token = null
}

export const listCampaigns = async (page: number, pageSize = PAGE_SIZE) => {
  const response = await axios.get<PaginatedCampaigns>(
    `${API_BASE_URL}/campaigns`,
    {
      params: {
        limit: pageSize,
        offset: (page - 1) * pageSize
      },
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    }
  )

  return response.data
}

export const getCampaign = async (campaignId: string) => {
  const response = await axios.get<{ data: Campaign }>(
    `${API_BASE_URL}/campaigns/${campaignId}`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    }
  )

  return response.data.data
}

export const createCampaign = async (payload: CreateCampaignPayload) => {
  validateCampaignPayload(payload)
  const response = await axios.post<{
    data: Campaign
  }>(`${API_BASE_URL}/campaigns`, payload, {
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  })

  return response.data.data
}

export const scheduleCampaign = async (
  campaignId: string,
  timestamp: string
) => {
  const response = await axios.post<{ data: Campaign }>(
    `${API_BASE_URL}/campaigns/${campaignId}/schedule`,
    { scheduledAt: timestamp },
    {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    }
  )

  return response.data.data
}

export const sendCampaign = async (campaignId: string) => {
  const response = await axios.post<{ data: Campaign }>(
    `${API_BASE_URL}/campaigns/${campaignId}/send`,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    }
  )

  return response.data.data
}

export const deleteCampaign = async (campaignId: string) => {
  const response = await axios.delete<{ data: { deletedId: string } }>(
    `${API_BASE_URL}/campaigns/${campaignId}`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    }
  )

  return response.data.data
}
