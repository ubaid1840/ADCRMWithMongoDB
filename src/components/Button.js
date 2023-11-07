import { useState } from "react"
import { TouchableOpacity, Text, StyleSheet, Image, View } from "react-native"


const AppBtn = (props) => {
    
    return(
    <TouchableOpacity
        style={[props.btnStyle]}
        onPress={props.onPress}
        activeOpacity={0.7}
    >
        <View style={{flexDirection:'row', alignItems:'center'}}>
        {props.imgSource ? <Image style = {{width:20, height:20, marginRight:10}} source = {props.imgSource} tintColor='#FFFFFF'></Image> : null}
        <Text style={props.btnTextStyle}>{props.title}</Text>
        </View>
    </TouchableOpacity>
    )
}

export default AppBtn