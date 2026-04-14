import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type AuthState = {
  token: string | null
  userEmail: string | null
}

const initialState: AuthState = {
  token: null,
  userEmail: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; userEmail: string }>
    ) => {
      state.token = action.payload.token
      state.userEmail = action.payload.userEmail
    },
    clearCredentials: (state) => {
      state.token = null
      state.userEmail = null
    }
  }
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
