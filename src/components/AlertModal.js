import { BlurView } from "expo-blur"
import { Modal, View, Text, Image, StyleSheet, TouchableWithoutFeedback } from "react-native"



const AlertModal = ({ isVisible, onClose, img, txt, centeredViewStyle, modalViewStyle, tintColor, txtStyle }) => {

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[centeredViewStyle]}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={modalViewStyle}>
                        <View style={{ flexDirection: 'row', alignItems:'center' }}>
                            <Image 
                            style={{ height: 50, width: 50 }} 
                            source={img}
                            tintColor={tintColor}
                            resizeMode='contain'></Image>
                            <Text style={txtStyle}>{txt}</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}


export default AlertModal