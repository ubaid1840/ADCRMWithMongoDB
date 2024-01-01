import { Dimensions, StyleSheet } from "react-native";


const styles = StyleSheet.create({
    layoutCardStyle: {
        width: 220,
        height: 150,
        borderRadius: 10
      },
    container: {
        flex: 1,
        // backgroundColor: '#000000E3',
        // justifyContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
        // backdropFilter: 'blur(10px)'
    },
    card: {
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
        padding:15,
        borderRadius: 10,
      },
      cardStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: 10,
      },
      cardTimestamp: {
        fontSize: 12,
        color: '#555',
        marginBottom: 5,
      },
      cardNote: {
        fontSize: 14,
        color: '#333',
      },
      cardHeader : {
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
      },

    oval1: {

        position: 'absolute',
        bottom: -30,
        left: -(Dimensions.get('window').width - 250),
        borderRadius: 500,
        backgroundColor: '#00355d',
        transform: [{ rotate: '150deg' }],
        height: (Dimensions.get('window').height),
        width: 300
    },
    oval2: {
        position: 'absolute',
        top: -30,
        //    left: -(Dimensions.get('window').width-250),
        right: -(Dimensions.get('window').width - 250),
        borderRadius: 500,
        backgroundColor: '#00355d',
        transform: [{ rotate: '150deg' }],
        height: (Dimensions.get('window').height),
        width: 300
    },
    button: {
        height: 50,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
        marginTop: 10
    },
    fill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'green', // Change to the button's color
        overflow: 'hidden'
    },
    gradient1: {
        ...StyleSheet.absoluteFill,
        opacity: 0.4,
    },
    gradient2: {
        ...StyleSheet.absoluteFill,
        opacity: 0.3,
        transform: [{ rotate: '45deg' }],
    },
    gradient3: {
        ...StyleSheet.absoluteFill,
        opacity: 0.2,
        transform: [{ rotate: '90deg' }],
    },
    gradient4: {
        ...StyleSheet.absoluteFill,
        opacity: 0.1,
        transform: [{ rotate: '135deg' }],
    },
    content: {
        // position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        borderRadius: 10,
        width: '100%',
        maxWidth: 350,
        backgroundColor: '#D6E6FF',
        borderColor: '#336699',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.25,
        // shadowRadius: 10,
        // elevation: 5,
    },
    title: {
        fontSize: 16,
        // color: '#1E4163',
        fontFamily: 'inter-bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#FFFFFF'
    },
    inputContainer: {
        width: '100%',
        marginVertical: 10,

    },
    input: {

        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        borderWidth: 3,
        borderColor: '#23d3d3',
        // outlineStyle: 'none'
    },
    withBorderInputContainer: {
        // borderColor: '#558BC1',
        // shadowColor: '#558BC1',
        // shadowOffset: { width: 0, height: 0 },
        // shadowOpacity: 1,
        // shadowRadius: 10,
        // elevation: 0,
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgetPasswordButton: {
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    forgetPasswordText: {
        color: '#333',
        fontSize: 14,
        fontWeight: 'bold',
    },
    forgetPasswordTextHover: {
        color: '#558BC1',
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    signupContainer: {
        marginTop: 10,
        flexDirection: 'row',
    },
    signupText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    btn: {
        width: '100%',
        height: 50,
        backgroundColor: '#23d3d3',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        // marginTop: 10,
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'inter-bold',
        marginLeft: 10,
        marginRight: 10
    },
    activityIndicatorStyle: {
        flex: 1,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2E2E2E95'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
        maxHeight: '98%',
        maxWidth: '95%'
    },
    shape: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 50,
        borderRightWidth: 50,
        borderTopWidth: 50,
        borderBottomWidth: 50,
        borderLeftColor: 'blue',
        borderRightColor: 'pink',
        borderBottomColor: 'orange',
        borderTopColor: 'red'
    },
    mainCard: {
        marginVertical: 10,
        backgroundColor: 'white',
        borderRadius: 0,
        borderRightColor: '#90EE90',
        borderRightWidth: 4,
        borderLeftColor: '#0EBBC4',
        borderLeftWidth: 4,
        alignSelf: 'center',
    },
    txtStyle1: {
        fontFamily: 'inter-regular',
        fontSize: 13,
        width: 100,
    },
    txtStyle2: {
        fontFamily: 'inter-semibold',
        fontSize: 13,
    },
    formRowStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderBottomColor: '#ccc',

        marginTop: 8,
        shadowColor: '#BADBFB',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 0,
        // borderRadius: 20,
        // marginLeft: 5,
        // marginRight: 5,
        width: 'auto',
        justifyContent: 'space-between'
    },
    formCellStyle: {
        justifyContent: 'center',
        flex: 1,
        minHeight: 50,
        maxWidth: 150

        // paddingLeft: 20
    },
    formEntryTextStyle: {
        fontFamily: 'inter-regular',
        paddingHorizontal: 20,
        paddingVertical: 5,
        fontSize: 13,
        color: '#000000'
    },

    formColumnHeaderRowStyle: {
        flexDirection: 'row',
        backgroundColor: '#f2f2f2',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        width: 'auto',
        justifyContent: 'space-between',
        // alignItems: 'center',
    },
    formColumnHeaderCellStyle: {
        // width: 160,
        // paddingLeft:20
        flex: 1,
        maxWidth: 150

    },
    formColumnHeaderTextStyle: {
        fontFamily: 'inter-bold',
        marginBottom: 5,
        // textAlign: 'center',
        paddingHorizontal: 20,
        color: '#5A5A5A',
        fontSize: 13
    },
    timeStatus1:{
        height:10,
        width:10,
        backgroundColor:'red',
        borderRadius:5
    },
    timeStatus2:{
        height:10,
        width:10,
        backgroundColor:'green',
        borderRadius:5
    },
    singleRecordText : {
        maxWidth: '50%', 
        fontFamily:'inter-regular', 
        fontSize:12
    },
    mainLayout : {
        flex: 1, 
        alignItems: 'center', 
        padding:10
    }
});

export default styles