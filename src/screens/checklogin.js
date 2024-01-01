import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useState, useEffect, useRef, useContext } from 'react';
import app from '../config/firebase';
import { ActivityIndicator, ScrollView, Alert, Animated, Image, View, Text, Dimensions, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from "expo-constants";
import * as Network from 'expo-network';
import { Layout } from '@ui-kitten/components'
import { AuthContext } from '../store/context/AuthContext';
import { PeopleContext } from '../store/context/PeopleContext';
import * as Location from 'expo-location'
import axios from 'axios';
import { collection, doc, getDoc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device'
import { TokenContext } from '../store/context/TokenContext';
import { registerForPushNotificationsAsync } from '../function/tokenFunction';



const CheckLogin = (props) => {

    const auth = getAuth(app)
    const startAnimation = useRef(new Animated.Value(0)).current
    const scaleLogo = useRef(new Animated.Value(Dimensions.get('window').width)).current
    const scaleText = useRef(new Animated.Value(1)).current
    const moveLogo = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
    const moveText = useRef(new Animated.ValueXY({ x: Dimensions.get('window').width, y: 0 })).current
    const moveLogoText = useRef(new Animated.Value(0)).current
    const [loading, setLoading] = useState(false)
    const { state: authState, setAuth } = useContext(AuthContext)
    const { state: peopleState, setPeople } = useContext(PeopleContext)
    const { state: tokenState, setToken } = useContext(TokenContext)

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
                            // const res = await requestLocationPermission()
                            // if (res == true)
                            checkLogin()
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
                if (user) {
                    try {
                        //console.log(user.email)
                        const db = getFirestore(app)
                        await getDocs(collection(db, 'AllowedUsers'))
                            .then((snapshop) => {
                                let list = []
                                snapshop.forEach((docs) => {
                                    list.push({ ...docs.data(), 'id': docs.id })
                                })
                                setPeople(list)
                                const updatedList = [...list.filter(item => item.email === user.email)]
                                //console.log(updatedList)
                                if (updatedList.length != 0 && updatedList[0].designation != 'Owner') {
                                    registerForPushNotificationsAsync().then(async token => {
                                        if (token) {
                                            await updateDoc(doc(db, "AllowedUsers", updatedList[0].id), {
                                                'token': token
                                            })
                                        }
                                        setToken(token)
                                    });
                                    setAuth(updatedList[0])
                                    if (updatedList[0].designation == 'Manager') {
                                        setLoading(false)
                                        props.navigation.replace('afterloginmanager')
                                    }
                                    else {
                                        setLoading(false)
                                        props.navigation.replace('afterloginemployee')
                                    }
                                }
                                else {
                                    signOut(auth).then(() => {
                                        setLoading(false)
                                        props.navigation.replace('login')
                                    }).catch((error) => {
                                        //console.log('error')
                                        setLoading(false)
                                        props.navigation.replace('login')
                                    });
                                }

                            })

                    } catch (error) {
                        // console.log(error)
                        setLoading(false)
                        Alert.alert('Error', 'Contact Owner', [
                            {
                                text: 'Close',
                                onPress: () => {
                                    signOut(auth).then(() => {
                                        setLoading(false)
                                        props.navigation.replace('login')
                                    }).catch((error) => {
                                        //console.log('error')
                                        setLoading(false)
                                        props.navigation.replace('login')
                                    });
                                }
                            }
                        ])

                    }
                }
                else {
                    setLoading(false)
                    props.navigation.replace('login')
                }
            });

        } catch (error) {
            Alert.alert('Error', "Connection error", [
                {
                    text: 'Close',
                    onPress: () => props.navigation.replace('login')
                }
            ])
            setLoading(false)
        }

    }


    async function requestLocationPermission() {
        let locationPermission = await Location.requestForegroundPermissionsAsync();

        return new Promise((resolve, reject) => {
            if (locationPermission.status == 'granted') {
                resolve(true)
            }
            else {
                Alert.alert('Error', 'Go to settings and allow location permissions', [
                    {
                        text: 'Close',
                        onPress: () => {
                            reject(false)
                            BackHandler.exitApp()
                        }
                    }
                ])
            }
        })
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