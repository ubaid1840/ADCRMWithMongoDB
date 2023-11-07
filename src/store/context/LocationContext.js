import { createContext, useReducer } from "react";
import { SET_LOCATION} from '../action/LocationAction'
import { myLocationReducer } from '../reducer/LocationReducer'

export const LocationContext = createContext()

const LocationContextProvider = (props) => {

    const [state, dispatch] = useReducer(myLocationReducer, { value: { data: null }})

    const setLocation = (data) => {
        dispatch({ type: SET_LOCATION, payload: { data: data } })
    }
    return (
        <LocationContext.Provider
            value={{ state, setLocation }}
        >
            {props.children}
        </LocationContext.Provider>
    )
}

export default LocationContextProvider