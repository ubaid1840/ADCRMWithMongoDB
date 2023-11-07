import { SET_TASK } from '../action/TaskAction'

export const myTaskReducer = (state, action) => {
  switch (action.type) {
    case SET_TASK:
      let newTaskState = { ...state }
      newTaskState.value.data = action.payload.data       
      return newTaskState
      break
    default:
      return state
  }
}

