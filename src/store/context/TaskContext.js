import { createContext, useReducer } from "react";
import { SET_TASK} from '../action/TaskAction'
import { myTaskReducer } from '../reducer/TaskReducer'

export const TaskContext = createContext()

const TaskContextProvider = (props) => {

    const [state, dispatch] = useReducer(myTaskReducer, { value: { data: [] }})

    const setTaskList = (data) => {
        dispatch({ type: SET_TASK, payload: { data: data } })
    }
    return (
        <TaskContext.Provider
            value={{ state, setTaskList }}
        >
            {props.children}
        </TaskContext.Provider>
    )
}

export default TaskContextProvider