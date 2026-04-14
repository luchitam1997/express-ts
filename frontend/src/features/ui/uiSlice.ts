import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { NotificationSeverity } from '../../types'

type NotificationState = {
  message: string
  severity: NotificationSeverity
} | null

type UiState = {
  notification: NotificationState
}

const initialState: UiState = {
  notification: null
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{ message: string; severity: NotificationSeverity }>
    ) => {
      state.notification = action.payload
    },
    clearNotification: (state) => {
      state.notification = null
    }
  }
})

export const { showNotification, clearNotification } = uiSlice.actions
export default uiSlice.reducer
