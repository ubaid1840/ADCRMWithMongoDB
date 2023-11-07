import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect, useRef, useContext } from 'react';
import app from '../config/firebase';
import { ActivityIndicator, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Animated, Image, View, Text } from 'react-native';
import { Dimensions } from 'react-native';
import Constants from "expo-constants";
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import { RefreshControl } from 'react-native';
import * as Network from 'expo-network';
import Toast from 'react-native-root-toast';
import { Layout } from '@ui-kitten/components'
import { AuthContext } from '../store/context/AuthContext';
import { PeopleContext } from '../store/context/PeopleContext';
import { LocationContext } from '../store/context/LocationContext';
import * as Location from 'expo-location'
import axios from 'axios';



const CheckLogin = (props) => {

    const auth = getAuth(app)
    const startAnimation = useRef(new Animated.Value(0)).current
    const scaleLogo = useRef(new Animated.Value(Dimensions.get('window').width)).current
    const scaleText = useRef(new Animated.Value(1)).current
    const moveLogo = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
    const moveText = useRef(new Animated.ValueXY({ x: Dimensions.get('window').width, y: 0 })).current
    const moveLogoText = useRef(new Animated.Value(0)).current
    const [loading, setLoading] = useState(false)
    // const { state: authState, setAuth, clearAuth } = useContext(AuthContext)
    const [height, setHeight] = useState(Dimensions.get('screen').height)
    const { state: authState, setAuth } = useContext(AuthContext)
    const { state: peopleState, setPeople } = useContext(PeopleContext)
    const { state: locationState, setLocation } = useContext(LocationContext)


    useEffect(() => {
        setTimeout(() => {

            Animated.timing(startAnimation, {
                toValue: -Dimensions.get('window').height + 65,
                useNativeDriver: true
            })
            Animated.timing(scaleLogo, {
                toValue: 200,
                duration: 500,
                useNativeDriver: false
            }).start(() => {
                Animated.timing(moveText, {
                    toValue: {
                        x: 0,
                        y: -(Dimensions.get('window').height / 2 - 100) + Constants.statusBarHeight,
                    },
                    duration: 300,
                    useNativeDriver: false
                }).start(() => {
                    Animated.timing(moveLogoText, {
                        toValue: -(Dimensions.get('window').height / 2 - 100) + Constants.statusBarHeight,
                        duration: 500,
                        useNativeDriver: false
                    }).start(() => {
                        setLoading(true)
                        setTimeout(async () => {
                            setLoading(true)
                            await checkNetworkStatus()
                        }, 800)
                    })
                })

            })
            Animated.timing(scaleText, {
                toValue: 0.8,
                useNativeDriver: true
            })

        }, 500)
    }, [])

    const checkLogin = () => {

        try {
            onAuthStateChanged(auth, async (user) => {
                if (user == null) {
                    setLoading(false)
                    props.navigation.navigate('login')
                }
                if (user) {

                    try {
                        let whereTo = 'afterlogin'
                        let updatedList = []
                        await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/user`)
                            .then(async(response) => {
                                let list = [...response.data]
                                console.log(list)
                                setPeople(list)
                                updatedList = list.filter(item => item.email == getAuth().currentUser.email)
                                console.log('1')
                                console.log(updatedList)
                                setAuth(updatedList[0])
                                if (updatedList[0].designation == 'Owner') {
                                    whereTo = 'afterlogin'
                                }
                                else if (updatedList[0].designation == 'Manager') {
                                    whereTo = 'afterloginmanager'
                                }
                                else {
                                    whereTo = 'afterloginemployee'
                                }
                                let currentLocation = await Location.getCurrentPositionAsync()
                                if (currentLocation) {
                                    setLocation(currentLocation)
                                    setLoading(false)
                                    props.navigation.navigate(whereTo)
                                }
                            })

                      

                    } catch (error) {
                        console.log('ubaid')
                        console.log(error)
                        setLoading(false)
                        props.navigation.navigate('login')
                    }
                }
            });
        } catch (error) {
            console.log('ubaid1')
            console.log(error)
            console.log('no connection')
            setLoading(false)
            let toast = Toast.show(' Weak or no internet Connection', {
                duration: Toast.durations.LONG,
            });
            setTimeout(function hideToast() {
                Toast.hide(toast);
            }, 1000);
        }

    }


    async function checkNetworkStatus() {
        const status = await Network.getNetworkStateAsync();
        if (status.isConnected == false) {

            setLoading(false)
            let toast = Toast.show(' Weak or no internet Connection', {
                duration: Toast.durations.SHORT,
            });
            setTimeout(function hideToast() {
                Toast.hide(toast);
            }, 1000);
        }
        else {

            checkLogin()
        }
    }

    return (

        <Layout style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.Image
                style={{
                    height: scaleLogo,
                    width: scaleLogo,
                    marginBottom: 0,
                    transform: [{ translateY: moveLogo.y }],

                }}
                source={require("../../assets/senfengLogo.png")}
            ></Animated.Image>

            <ActivityIndicator color="#57D1D7" size="large" animating={loading} />


            <StatusBar style="light" />


        </Layout>
    );
}


export default CheckLogin

{/* <View style={{alignSelf:'flex-end', marginBottom:100}}>
                <Image style={{ height: 100, width: 100, marginBottom: 20 }} source={require('../../assets/applogo.png')}></Image>

                <ActivityIndicator color="#57D1D7" size="large" animating={true} />
            </View> */}