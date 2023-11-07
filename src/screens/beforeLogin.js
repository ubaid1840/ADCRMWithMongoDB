import { View, Text, StyleSheet } from "react-native"
import AppBtn from "../components/Button"
import styles from "../styles/styles"
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font';
import { useEffect } from "react"


const BeforeLoginScreen = (props) => {

    useEffect(() => {
        async function prepare() {
            await SplashScreen.preventAutoHideAsync()
        }
        prepare()
    }, [])

    let [fontsLoaded] = useFonts({
        'futura-extra-black': require('../../assets/fonts/Futura-Extra-Black-font.ttf'),
        'proxima': require('../../assets/fonts/Proxima-Nova-Font.otf')
    });

    if (!fontsLoaded) {
        return undefined
    }
    else {
        SplashScreen.hideAsync()
    }


    return (
        <View style={[styles.container, {backgroundColor:'#003152'}]}>
            {/* <CarouselComponent /> */}
            {/* <LinearGradient colors={['#AE276D', '#B10E62']} style={styles.gradient3} />
            <LinearGradient colors={['#2980b9', '#3498db']} style={styles.gradient1} />
            <LinearGradient colors={['#678AAC', '#9b59b6']} style={styles.gradient2} />
            <LinearGradient colors={['#EFEAD2', '#FAE2BB']} style={styles.gradient4} /> */}
            {/* <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} /> */}
            <View style={{ width: '100%', paddingHorizontal: 20, alignItems: 'center' }}>
                <Text style={[styles.title, { fontFamily: 'futura-extra-black' }]}>D V I R</Text>
                <View style={styles.inputContainer}>
                </View>
            </View>
            <View style={{ position: 'absolute', bottom: 50, width: '100%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20 }}>
                    <AppBtn
                        title="Login"
                        btnStyle={[styles.btn, { width: 150 }]}
                        btnTextStyle={styles.btnText}
                        onPress={() => {
                            props.navigation.navigate('login')
                        }} />
                    <AppBtn
                        title="Signup"
                        btnStyle={[styles.btn, { width: 150 }]}
                        btnTextStyle={styles.btnText}
                        onPress={() => {
                            props.navigation.navigate('signup')
                        }} />
                </View>
            </View>
        </View>
    )
}

export default BeforeLoginScreen