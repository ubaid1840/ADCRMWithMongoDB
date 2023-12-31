import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef, useContext } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import styles from "../styles/styles";
import app from "../config/firebase";
import { Alert } from "react-native";
import { Layout, Text, Input, Button, useTheme } from '@ui-kitten/components'
import axios from "axios";

const SignupScreen = (props) => {

    const theme = useTheme()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false)

    const [isEmailValid, setIsEmailValid] = useState(false)
    const [isPasswordValid, setIsPasswordValid] = useState(false)
    const [isButtonActive, setIsButtonActive] = useState(false)

    const auth = getAuth(app)


    useEffect(() => {
        props.navigation.addListener('beforeRemove', (e) => {
            if (e.data.action.type == "GO_BACK") {
                e.preventDefault();
            }
            else {
                props.navigation.dispatch(e.data.action)
            }
        });
    }, [props.navigation]);

    useEffect(() => {

        if (email.includes('@') && email.includes('.com')) {
            setIsEmailValid(true)
        } else {
            setIsEmailValid(false)
        }

        if (password.length > 7) {
            setIsPasswordValid(true)
        } else {
            setIsPasswordValid(false)
        }


    }, [email, password])

    useEffect(() => {
        if (isEmailValid == true && isPasswordValid == true) {
            setIsButtonActive(false)
        }
        else {
            setIsButtonActive(true)
        }
    }, [isEmailValid, isPasswordValid])


    const handleSignup = async () => {

        const db = getFirestore(app)
        let list = []
        await getDocs(collection(db, 'AllowedUsers'))
            .then((snapshot) => {
                snapshot.forEach((docs) => {
                    list.push(docs.data())
                })
            })

        let i = 0
        const fetchEmail = [...list.filter((item) => item.email == email)]
        if (fetchEmail.length != 0) {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    setLoading(false)
                    Alert.alert('Success', 'Signup succesful', [
                        {
                            text: 'Dashboard',
                            onPress: () => {
                                setEmail('')
                                setPassword('')
                                props.navigation.goBack()
                            }
                        }
                    ])
                    // ...
                })
                .catch((error) => {
                    setLoading(false)
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    Alert.alert('Failed', errorCode.replace('auth/', ""))

                    // ..
                });
        }

        else {
            Alert.alert('Error', 'You are not allowed to signup')
            setLoading(false)
        }

    }

    const CustomActivityIndicator = () => {
        return (
            <View style={styles.activityIndicatorStyle}>
                <ActivityIndicator color="#57D1D7" size="large" />
            </View>
        );
    };


    return (
        <>

            <Layout style={[styles.container]}>

                <View style={styles.oval1}></View>
                <View style={styles.oval2}></View>
                <View style={{ width: '100%', maxWidth: 350, alignItems: 'center' }}>
                    <Text style={[styles.title]}>Enter credentials to signup</Text>

                    <View style={styles.inputContainer}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>


                            <Input
                                style={[{ width: '100%', }]}
                                size="large"
                                placeholderTextColor="#868383DC"
                                label="Enter Email"
                                value={email}
                                onChangeText={setEmail}
                                accessoryLeft={()=> <Image style={{height:20, width:20}} source={require('../../assets/email_icon.png')} tintColor={theme['color-basic-500']}></Image>}
                            />
                            {!isEmailValid ? <Text status='danger' style={{ fontFamily: 'inter-regular', fontSize: 10, marginTop: 5, width: '100%' }}>Enter valid email</Text> : null}

                            <Input
                                style={[{ width: '100%', marginTop: 20 }]}
                                size="large"
                                placeholderTextColor="#868383DC"
                                label="Enter Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                accessoryLeft={()=> <Image style={{height:20, width:20}} source={require('../../assets/password_icon.png')} tintColor={theme['color-basic-500']}></Image>}

                            />
                            {!isPasswordValid ? <Text status='danger' style={{ fontFamily: 'inter-regular', fontSize: 10, marginTop: 5, width: '100%' }}>Password length should be more than 8 characters</Text> : null}
                        </View>
                    </View>

                    <View style={{ width: 350, marginTop: 20 }}>
                        <Button
                            disabled={isButtonActive}
                            onPress={() => {
                                setLoading(true)
                                handleSignup()
                            }}>Signup</Button>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'inter-medium', fontSize: 14 }}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => props.navigation.replace('login')}>
                            <Text style={{ fontFamily: 'inter-bold' }} status="primary"> Login</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Layout >

            {loading ? CustomActivityIndicator() : null}

            <StatusBar style='light' />
        </>
    );
}

export default SignupScreen