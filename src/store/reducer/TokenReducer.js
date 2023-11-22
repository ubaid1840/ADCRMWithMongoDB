import { SET_TOKEN } from '../action/TokenAction'

export const myTokenReducer = (state, action) => {
  switch (action.type) {
    case SET_TOKEN:
      let newTokenState = { ...state }
      newTokenState.value.data = action.payload.data       
      return newTokenState
      break
    default:
      return state
  }
}

