import { createContext, useReducer } from "react";
import { SET_PEOPLE} from '../action/PeopleAction'
import { myPeopleReducer } from '../reducer/PeopleReducer'

export const PeopleContext = createContext()

const PeopleContextProvider = (props) => {

    const [state, dispatch] = useReducer(myPeopleReducer, { value: { data: [] }})

    const setPeople = (data) => {
        dispatch({ type: SET_PEOPLE, payload: { data: data } })
    }
    return (
        <PeopleContext.Provider
            value={{ state, setPeople }}
        >
            {props.children}
        </PeopleContext.Provider>
    )
}

export default PeopleContextProvider