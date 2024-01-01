import { StyleSheet } from "react-native";


const universalStyles = StyleSheet.create({
    tableHeaderTxtStyle: {
        fontSize: 14,
        fontFamily: 'inter-semibold',
        color: 'white'
    },
    formTxtStyle: {
        fontSize: 13,
        color:'white'
    },
    labelStyle: {
        fontFamily: 'inter-medium',
        fontSize: 13,
        marginBottom: 5
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#eff1f7'
    },
    activityIndicatorStyle: {
        flex: 1,
        position: 'absolute',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 'auto',
        marginBottom: 'auto',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        backgroundColor: '#788C9A95'
    },
    validityStyle :{
        paddingLeft: 5, 
        fontSize: 10, 
        alignSelf: 'flex-start'
    },
    beforeLoginRouteTxt: {
        color: '#008dff',
        fontSize: 14,
        fontFamily: 'inter-regular',
    },
    beforeLoginRouteTxtHover: {
        color: '#000000',
        textDecorationLine: 'underline',
    },
    drawerStyle: {
        width: 270,
        height:'100%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
        zIndex:1
      },
      activityIndicatorStyle: {
        flex: 1,
        position: 'absolute',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 'auto',
        marginBottom: 'auto',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        backgroundColor: '#FFFFFFDD',
    },
})

export default universalStyles