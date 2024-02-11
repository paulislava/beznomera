import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserBalance, UserTransaction } from '@paulislava/shared/user/user.types'

export interface UserStore {
  pending: boolean
  balance: UserBalance | null
  transactions: UserTransaction[] | null
}

const initialState: UserStore = {
  pending: false,
  balance: null,
  transactions: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchBalance(state: UserStore) {
      state.pending = true
    },
    fetchBalanceSuccess(state: UserStore, action: PayloadAction<UserBalance>) {
      state.pending = false
      state.balance = action.payload
    },
    fetchBalanceFailure(state: UserStore) {
      state.pending = false
    },

    fetchTransactions(state: UserStore) {
      state.pending = true
    },
    fetchTransactionsSuccess(state: UserStore, action: PayloadAction<UserTransaction[]>) {
      state.transactions = action.payload
      state.pending = false
    },
    fetchTransactionsFailure(state: UserStore) {
      state.pending = false
    }
  }
})

export const userActions = userSlice.actions
export const userReducer = userSlice.reducer
