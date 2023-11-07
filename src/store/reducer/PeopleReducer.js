import { SET_PEOPLE } from '../action/PeopleAction'

export const myPeopleReducer = (state, action) => {
  switch (action.type) {
    case SET_PEOPLE:
      let newPeopleState = { ...state }
      newPeopleState.value.data = action.payload.data       
      return newPeopleState
      break
    default:
      return state
  }
}

