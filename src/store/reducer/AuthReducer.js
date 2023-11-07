import { CLEAR_AUTH, SET_AUTH } from '../action/AuthAction'

export const myAuthReducer = (state, action) => {
  switch (action.type) {
    case SET_AUTH:
      let newAuthState = { ...state }
      newAuthState.value.data = action.payload.data       
      return newAuthState
      break
    case CLEAR_AUTH:
      let newClearState = { ...state }
      newAuthState.value.data = []
      return newClearState
      break
    default:
      return state
  }
}

