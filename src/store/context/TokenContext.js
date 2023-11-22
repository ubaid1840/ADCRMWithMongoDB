import { createContext, useReducer } from "react";
import { SET_TOKEN} from '../action/TokenAction'
import { myTokenReducer } from '../reducer/TokenReducer'

export const TokenContext = createContext()

const TokenContextProvider = (props) => {

    const [state, dispatch] = useReducer(myTokenReducer, { value: { data: [] }})

    const setToken = (data) => {
        dispatch({ type: SET_TOKEN, payload: { data: data } })
    }


    return (
        <TokenContext.Provider
            value={{ state, setToken }}
        >
            {props.children}
        </TokenContext.Provider>
    )
}

export default TokenContextProvider