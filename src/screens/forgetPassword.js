import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef, useContext } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, LayoutAnimation } from 'react-native';
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import styles from "../styles/styles";
import app from "../config/firebase";
import { Alert } from "react-native";
import { Layout, Text, Input, Button, } from '@ui-kitten/components'

const ForgetPasswordScreen = (props) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
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

  }, [email])



 const handleForgetPassword = async() => {
    await sendPasswordResetEmail(auth, email)
    .then(() => {
        // Password reset email sent!
        // ..
        Alert.alert('Success', 'Check inbox for reset link')
        setLoading(false)
        setEmail("")
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert('Failed', errorCode.replace('auth/', ""))
        setLoading(false)
        // ..
    });
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
          <Text style={[styles.title]}>Enter email to reset password</Text>

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

            </View>
          </View>

          <View style={{ width: '100%', marginTop: 20 }}>
            <Button
              disabled={!isEmailValid}
              onPress={() => {
                  setLoading(true)
                  handleForgetPassword()
                
              }}>Reset</Button>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'inter-medium', fontSize: 14 }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => {
                console.log('ubaid')
                setEmail('')
                props.navigation.goBack()}}>
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

export default ForgetPasswordScreen