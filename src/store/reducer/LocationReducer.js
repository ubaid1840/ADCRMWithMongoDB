import { SET_LOCATION } from '../action/LocationAction'

export const myLocationReducer = (state, action) => {
  switch (action.type) {
    case SET_LOCATION:
      let newLocationState = { ...state }
      newLocationState.value.data = action.payload.data       
      return newLocationState
      break
    default:
      return state
  }
}

