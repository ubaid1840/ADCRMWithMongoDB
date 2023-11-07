import { StyleSheet, View, Text } from "react-native"



const NameAvatar = (props) => {


    return (
        <View style={[styles.driverAndAssetAvatar, props.viewStyle]}>
            <Text style={[{ fontSize: 25, color: 'grey' }, props.textStyle]}>{props.title}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    driverAndAssetAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 25,
        color: 'grey'
    }
})

export default NameAvatar;