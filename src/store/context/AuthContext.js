import { createContext, useReducer } from "react";
import { CLEAR_AUTH, SET_AUTH} from '../action/AuthAction'
import { myAuthReducer } from '../reducer/AuthReducer'

export const AuthContext = createContext()

const AuthContextProvider = (props) => {

    const [state, dispatch] = useReducer(myAuthReducer, { value: { data: [] }})

    const setAuth = (data) => {
        dispatch({ type: SET_AUTH, payload: { data: data } })
    }

    const clearAuth = () => {
        dispatch({ type: CLEAR_AUTH })
    }


    return (
        <AuthContext.Provider
            value={{ state, setAuth, clearAuth }}
        >
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider