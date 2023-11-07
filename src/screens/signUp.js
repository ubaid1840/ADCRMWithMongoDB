import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef, useContext } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, LayoutAnimation } from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import styles from "../styles/styles";
import app from "../config/firebase";
import { Alert } from "react-native";
import { Layout, Text, Input, Button, } from '@ui-kitten/components'

const SignupScreen = (props) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false)

    const [isEmailValid, setIsEmailValid] = useState(false)
    const [isPasswordValid, setIsPasswordValid] = useState(false)
    const [isButtonActive, setIsButtonActive] = useState(false)

    const auth = getAuth(app)

    
  useEffect(() => {
    props.navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
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

    useEffect(()=>{
        if(isEmailValid == true && isPasswordValid == true){
            setIsButtonActive(false)
        }
        else {
            setIsButtonActive(true)
        }
    }, [isEmailValid, isPasswordValid])


    const handleSignup = async () => {

        const db = getFirestore(app)
        let list = []
        await getDocs(query(collection(db, 'AllowedUsers'), orderBy('id', 'desc')))
            .then((snapshot) => {
                snapshot.forEach((docs) => {
                    list.push(docs.data())
                })
            })

        let id = "1"
        let i = 0

        if (list.length != 0) {
            id = (parseInt(list[0].id) + 1).toString()
        }

        list.map((item) => {
            if (email == item.email) {
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

                i++
            }
        })

        if (i == 0) {
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
                        <TouchableOpacity onPress={() =>   props.navigation.goBack()}>
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